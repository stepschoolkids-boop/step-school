/**
 * STEP SCHOOL KIDS — trial-lesson leads → Google Sheet
 *
 * Paste this file into the Apps Script editor of the leads spreadsheet
 * (Extensions → Apps Script), set the SECRET, then Deploy → New deployment →
 * Web app (Execute as: Me · Who has access: Anyone). Copy the /exec URL into
 * the site's SHEETS_WEBAPP_URL env var and the same secret into
 * SHEETS_WEBAPP_SECRET. Only the Next.js server calls this URL — never the browser.
 */

var SHEET_NAME = "Arizalar";
var HEADERS = ["Sana/vaqt", "Farzandning ismi", "Yoshi", "Ota-onaning telefon raqami", "Qulay vaqt", "Manba", "ID"];
var TIMEZONE = "Asia/Tashkent";
var DEDUPE_WINDOW = 300; // look back this many rows for a repeated submission id

function getSecret() {
  // Preferred: Project Settings → Script properties → SECRET. Fallback: paste it here.
  return PropertiesService.getScriptProperties().getProperty("SECRET") || "PASTE_THE_SAME_SECRET_AS_SHEETS_WEBAPP_SECRET";
}

function doGet() {
  return json({ ok: true, service: "step-school-kids-leads" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var secret = getSecret();
    if (!secret || secret.indexOf("PASTE_") === 0 || body.secret !== secret) {
      return json({ ok: false, error: "unauthorized" });
    }
    if (!body.childName || !body.parentPhone) return json({ ok: false, error: "missing fields" });

    lock.waitLock(8000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Idempotency: the same submission id is written once, even if the request is retried.
    var id = String(body.id || "");
    if (id) {
      var last = sheet.getLastRow();
      if (last > 1) {
        var n = Math.min(DEDUPE_WINDOW, last - 1);
        var ids = sheet.getRange(last - n + 1, HEADERS.length, n, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]) === id) return json({ ok: true, duplicate: true });
        }
      }
    }

    var stamp = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([
      stamp,
      String(body.childName).slice(0, 80),
      String(body.childAge || "").slice(0, 20),
      String(body.parentPhone).slice(0, 20),
      String(body.preferredTime || "").slice(0, 30),
      String(body.source || "stepschoolkids.uz").slice(0, 60),
      id.slice(0, 64),
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
