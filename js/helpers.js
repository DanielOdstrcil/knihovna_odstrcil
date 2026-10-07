/* =====================================================================
   Pomocné funkce (formátování data, escapování, toast)
   Soubor je součástí aplikace Knihovna a výpůjčky (viz README.md).
   ===================================================================== */

/* ---------- 2) POMOCNÉ FUNKCE ---------- */
const $ = s => document.querySelector(s);
// Ochrana proti vložení HTML z uživatelských vstupů (XSS).
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = iso => iso ? new Date(iso).toLocaleString('cs-CZ',{day:'numeric',month:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
// Hodnota pro <input type="datetime-local"> (místní čas bez sekund).
const toLocalInput = d => new Date(d - d.getTimezoneOffset()*60000).toISOString().slice(0,16);
const bookOf   = id => db.books.find(b => b.id === id);
const readerOf = id => db.readers.find(r => r.id === id);
// Aktivní výpůjčka = ještě nevrácená.
const isActive = l => !l.returned_at;
// Po termínu = nevrácená a termín už uplynul.
const isOverdue = l => isActive(l) && new Date(l.due_at) < new Date();
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('on'),2200); }
