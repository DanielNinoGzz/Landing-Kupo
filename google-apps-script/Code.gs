/** @OnlyCurrentDoc */
// Recibe las solicitudes de demo de la landing de KUPO y las guarda en esta hoja de cálculo.
// Instrucciones de instalación en README.md, sección "Solicitudes de demo en Google Sheets".

const SHEET_NAME = 'Solicitudes';
const HEADERS = ['Fecha', 'Nombre', 'Negocio', 'Contacto', 'Giro', 'Canales', 'Página'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Campo trampa: los humanos no lo ven, los bots suelen llenarlo.
  if (p.website) return respond_('ok');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_().appendRow([
      new Date(),
      clean_(p.nombre),
      clean_(p.negocio),
      clean_(p.contacto),
      clean_(p.giro),
      clean_(p.canales),
      clean_(p.pagina)
    ]);
  } finally {
    lock.releaseLock();
  }
  return respond_('ok');
}

// Abrir la URL del script en el navegador sirve para comprobar que está publicado.
function doGet() {
  return respond_('KUPO: el receptor de solicitudes de demo está activo.');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Recorta el texto y evita que Sheets interprete un valor como fórmula
// (también conserva teléfonos como "+52 81..." tal cual).
function clean_(value) {
  const s = String(value == null ? '' : value).trim().slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function respond_(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}
