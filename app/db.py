"""Postgres bilan ishlash — asyncpg."""
import json
import logging
from datetime import datetime, date
from typing import Any, Optional

import asyncpg

from . import config

log = logging.getLogger(__name__)
_pool: Optional[asyncpg.Pool] = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id              SERIAL PRIMARY KEY,
    slot            TEXT NOT NULL,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft',
    topic           TEXT,
    content_type    TEXT,
    lang            TEXT,
    body            TEXT,
    hashtags        TEXT,
    image_prompt    TEXT,
    image_file_id   TEXT,
    sources         TEXT,
    qc_score        INT,
    qc_notes        TEXT,
    approval_msg_id BIGINT,
    channel_msg_id  BIGINT,
    regen_count     INT NOT NULL DEFAULT 0,
    error           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS posts_sched_idx  ON posts (scheduled_at);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts (status);

CREATE TABLE IF NOT EXISTS weekly_plan (
    id           SERIAL PRIMARY KEY,
    week_start   DATE NOT NULL,
    day_offset   INT  NOT NULL,
    slot         TEXT NOT NULL,
    topic        TEXT NOT NULL,
    content_type TEXT NOT NULL,
    used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (week_start, day_offset, slot)
);

CREATE TABLE IF NOT EXISTS sources (
    id         SERIAL PRIMARY KEY,
    url        TEXT UNIQUE NOT NULL,
    kind       TEXT NOT NULL DEFAULT 'rss',
    label      TEXT,
    enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seen_items (
    fingerprint TEXT PRIMARY KEY,
    title       TEXT,
    url         TEXT,
    seen_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


async def init() -> None:
    global _pool
    dsn = config.DATABASE_URL
    _pool = await asyncpg.create_pool(dsn, min_size=1, max_size=5, command_timeout=30)
    async with _pool.acquire() as con:
        await con.execute(SCHEMA)
    log.info("Baza tayyor")


async def close() -> None:
    if _pool:
        await _pool.close()


def pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Baza hali ishga tushmagan")
    return _pool


# ---------- settings ----------
async def get_setting(key: str, default: Any = None) -> Any:
    async with pool().acquire() as con:
        row = await con.fetchrow("SELECT value FROM settings WHERE key=$1", key)
    if row is None:
        return default
    try:
        return json.loads(row["value"])
    except (json.JSONDecodeError, TypeError):
        return row["value"]


async def set_setting(key: str, value: Any) -> None:
    async with pool().acquire() as con:
        await con.execute(
            "INSERT INTO settings(key,value) VALUES($1,$2) "
            "ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",
            key, json.dumps(value, ensure_ascii=False),
        )


async def get_channel() -> str:
    """Joriy kanal — bot orqali /kanal bilan o'rnatiladi, bo'lmasa env dan."""
    return await get_setting("channel_id", config.CHANNEL_ID)


async def set_channel(chat_id: str, title: str = "", username: str = "") -> None:
    await set_setting("channel_id", chat_id)
    await set_setting("channel_title", title)
    await set_setting("channel_username", username)


async def channel_label() -> str:
    """Ko'rsatish uchun chiroyli nom: @username yoki sarlavha."""
    uname = await get_setting("channel_username", "")
    if uname:
        return f"@{uname}"
    title = await get_setting("channel_title", "")
    chat = await get_channel()
    return title or str(chat)


async def get_footer() -> str:
    """Post oxiridagi kontakt bloki."""
    val = await get_setting("footer", None)
    return config.POST_FOOTER if val is None else str(val)


async def set_footer(text: str) -> None:
    await set_setting("footer", text)


async def get_slots() -> dict:
    return await get_setting("slots", dict(config.DEFAULT_SLOTS))


async def set_slots(slots: dict) -> None:
    await set_setting("slots", slots)


async def is_paused() -> bool:
    return bool(await get_setting("paused", False))


# ---------- posts ----------
async def create_post(slot: str, scheduled_at: datetime, **fields) -> int:
    cols = ["slot", "scheduled_at"] + list(fields.keys())
    vals = [slot, scheduled_at] + list(fields.values())
    ph = ", ".join(f"${i+1}" for i in range(len(vals)))
    async with pool().acquire() as con:
        row = await con.fetchrow(
            f"INSERT INTO posts ({', '.join(cols)}) VALUES ({ph}) RETURNING id", *vals
        )
    return row["id"]


async def update_post(post_id: int, **fields) -> None:
    if not fields:
        return
    sets = ", ".join(f"{k}=${i+2}" for i, k in enumerate(fields))
    async with pool().acquire() as con:
        await con.execute(
            f"UPDATE posts SET {sets}, updated_at=now() WHERE id=$1",
            post_id, *fields.values(),
        )


async def get_post(post_id: int) -> Optional[asyncpg.Record]:
    async with pool().acquire() as con:
        return await con.fetchrow("SELECT * FROM posts WHERE id=$1", post_id)


async def upcoming_posts(limit: int = 10) -> list:
    async with pool().acquire() as con:
        return await con.fetch(
            "SELECT * FROM posts WHERE status IN ('draft','pending_approval','approved') "
            "ORDER BY scheduled_at LIMIT $1", limit,
        )


async def recent_published(limit: int = 20) -> list:
    async with pool().acquire() as con:
        return await con.fetch(
            "SELECT topic, body, scheduled_at FROM posts WHERE status='published' "
            "ORDER BY scheduled_at DESC LIMIT $1", limit,
        )


async def stats() -> dict:
    async with pool().acquire() as con:
        rows = await con.fetch("SELECT status, count(*) AS n FROM posts GROUP BY status")
    return {r["status"]: r["n"] for r in rows}


# ---------- weekly plan ----------
async def save_week_plan(week_start: date, items: list[dict]) -> None:
    async with pool().acquire() as con:
        async with con.transaction():
            await con.execute("DELETE FROM weekly_plan WHERE week_start=$1 AND used=FALSE", week_start)
            for it in items:
                await con.execute(
                    "INSERT INTO weekly_plan(week_start,day_offset,slot,topic,content_type) "
                    "VALUES($1,$2,$3,$4,$5) ON CONFLICT (week_start,day_offset,slot) "
                    "DO UPDATE SET topic=EXCLUDED.topic, content_type=EXCLUDED.content_type",
                    week_start, it["day_offset"], it["slot"], it["topic"], it["content_type"],
                )


async def get_week_plan(week_start: date) -> list:
    async with pool().acquire() as con:
        return await con.fetch(
            "SELECT * FROM weekly_plan WHERE week_start=$1 ORDER BY day_offset, slot", week_start
        )


async def take_plan_item(week_start: date, day_offset: int, slot: str) -> Optional[asyncpg.Record]:
    async with pool().acquire() as con:
        return await con.fetchrow(
            "UPDATE weekly_plan SET used=TRUE WHERE week_start=$1 AND day_offset=$2 "
            "AND slot=$3 AND used=FALSE RETURNING *",
            week_start, day_offset, slot,
        )


# ---------- sources ----------
async def list_sources(only_enabled: bool = True) -> list:
    q = "SELECT * FROM sources" + (" WHERE enabled=TRUE" if only_enabled else "") + " ORDER BY id"
    async with pool().acquire() as con:
        return await con.fetch(q)


async def add_source(url: str, kind: str = "rss", label: str = "") -> None:
    async with pool().acquire() as con:
        await con.execute(
            "INSERT INTO sources(url,kind,label) VALUES($1,$2,$3) ON CONFLICT (url) DO NOTHING",
            url, kind, label,
        )


async def remove_source(source_id: int) -> None:
    async with pool().acquire() as con:
        await con.execute("DELETE FROM sources WHERE id=$1", source_id)


# ---------- dedup ----------
async def is_seen(fingerprint: str) -> bool:
    async with pool().acquire() as con:
        return await con.fetchval("SELECT 1 FROM seen_items WHERE fingerprint=$1", fingerprint) is not None


async def mark_seen(fingerprint: str, title: str = "", url: str = "") -> None:
    async with pool().acquire() as con:
        await con.execute(
            "INSERT INTO seen_items(fingerprint,title,url) VALUES($1,$2,$3) "
            "ON CONFLICT (fingerprint) DO NOTHING", fingerprint, title[:500], url[:1000],
        )
