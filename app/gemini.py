"""Gemini REST klienti — matn, JSON va rasm generatsiya.

SDK o'rniga to'g'ridan-to'g'ri REST ishlatilgan: SDK versiyalari o'zgarganda
kod buzilmasin va model nomlarini env orqali almashtirish mumkin bo'lsin.
"""
import asyncio
import json
import logging
import re
from typing import Any, Optional

import httpx

from . import config

log = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(120.0, connect=20.0)


class GeminiError(RuntimeError):
    pass


async def _call(model: str, payload: dict, attempts: int = 3) -> dict:
    url = f"{config.GEMINI_BASE}/models/{model}:generateContent"
    headers = {
        "x-goog-api-key": config.GEMINI_API_KEY,
        "Content-Type": "application/json",
    }
    last_err: Optional[Exception] = None
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        for i in range(attempts):
            try:
                r = await client.post(url, headers=headers, json=payload)
                if r.status_code == 200:
                    return r.json()
                # 429 / 5xx — qayta urinamiz
                if r.status_code in (429, 500, 502, 503, 504):
                    last_err = GeminiError(f"HTTP {r.status_code}: {r.text[:400]}")
                    if i == attempts - 1:
                        break
                    wait = min(2 ** i * 5, 40)
                    log.warning("Gemini %s -> %s, %ss kutamiz", model, r.status_code, wait)
                    await asyncio.sleep(wait)
                    continue
                raise GeminiError(f"HTTP {r.status_code}: {r.text[:600]}")
            except httpx.HTTPError as e:
                last_err = e
                log.warning("Gemini tarmoq xatosi (%s/%s): %s", i + 1, attempts, e)
                if i == attempts - 1:
                    break
                await asyncio.sleep(min(2 ** i * 5, 40))
    raise GeminiError(f"Gemini javob bermadi: {last_err}")


def _extract_text(resp: dict) -> str:
    out = []
    for cand in resp.get("candidates", []):
        reason = cand.get("finishReason")
        if reason and reason not in ("STOP", "MAX_TOKENS"):
            log.warning("Gemini javobni to'xtatdi: finishReason=%s", reason)
        elif reason == "MAX_TOKENS":
            log.warning("Gemini token chegarasiga yetdi — javob kesilgan bo'lishi mumkin")
        for part in cand.get("content", {}).get("parts", []):
            if "text" in part:
                out.append(part["text"])
    return "\n".join(out).strip()


def _strip_fences(s: str) -> str:
    s = s.strip()
    m = re.search(r"```(?:json)?\s*(.*?)```", s, re.S)
    if m:
        s = m.group(1).strip()
    return s


async def generate_text(
    prompt: str,
    system: str = "",
    temperature: float = 0.8,
    use_search: bool = False,
    model: Optional[str] = None,
) -> str:
    payload: dict[str, Any] = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 8192},
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    if use_search:
        # Google Search grounding — yangiliklarni internetdan olish uchun
        payload["tools"] = [{"google_search": {}}]
    resp = await _call(model or config.TEXT_MODEL, payload)
    return _extract_text(resp)


async def generate_json(
    prompt: str,
    system: str = "",
    temperature: float = 0.7,
    use_search: bool = False,
    model: Optional[str] = None,
) -> Any:
    """JSON qaytaruvchi chaqiruv. Search yoqilganda responseMimeType ishlatilmaydi
    (Google Search grounding bilan birga qo'llab-quvvatlanmaydi), shuning uchun
    javob matnidan JSON ajratib olinadi."""
    payload: dict[str, Any] = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 16384},
    }
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
    if use_search:
        payload["tools"] = [{"google_search": {}}]
    else:
        payload["generationConfig"]["responseMimeType"] = "application/json"

    resp = await _call(model or config.TEXT_MODEL, payload)
    raw = _strip_fences(_extract_text(resp))
    if not raw:
        raise GeminiError("Gemini bo'sh javob qaytardi")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Ba'zan model matn ichiga JSON joylaydi — birinchi { ... } blokini olamiz
        m = re.search(r"[\{\[].*[\}\]]", raw, re.S)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
        raise GeminiError(f"JSON parse qilinmadi: {raw[:400]}")
