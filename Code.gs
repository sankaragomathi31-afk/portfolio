/**
 * Contact form receiver for the portfolio.
 *
 * SETUP
 * 1. Create a Google Sheet. Rename the first tab "Messages" and add headers in row 1:
 *    Timestamp | Name | Email | Message
 * 2. Copy the Sheet ID from its URL (the long string between /d/ and /edit).
 * 3. In Apps Script (script.google.com) create a new project, paste this file,
 *    and set SHEET_ID below.
 * 4. Deploy > New deployment > type "Web app".
 *    Execute as: Me. Who has access: Anyone.
 * 5. Copy the Web app URL and paste it into APPS_SCRIPT_URL in index.html.
 */

const SHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";
const SHEET_NAME = "Messages";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const name = String(data.name || "").slice(0, 200);
    const email = String(data.email || "").slice(0, 200);
    const message = String(data.message || "").slice(0, 5000);

    if (!name || !email || !message) {
      return json({ ok: false, error: "Missing fields" });
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([new Date(), name, email, message]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, message: "Portfolio contact endpoint is running." });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
