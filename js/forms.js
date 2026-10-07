/* =====================================================================
   Dialogy a formuláře (kniha, čtenář, výpůjčka, detail knihy)
   Soubor je součástí aplikace Knihovna a výpůjčky (viz README.md).
   ===================================================================== */

/* ---------- 6) DIALOGY A FORMULÁŘE ---------- */
const dlg = $('#dlg');
// Otevře dialog s formulářem. onSubmit dostane hodnoty polí a vrátí text chyby ('' = úspěch).
function form(title, fields, okText, onSubmit){
  dlg.innerHTML = `<form method="dialog" novalidate><h2>${title}</h2>${fields}
    <div class="err" id="err" hidden></div>
    <div class="foot"><button type="button" class="btn" data-close>Zrušit</button><button class="btn primary">${okText}</button></div></form>`;
  dlg.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const err = onSubmit(d);
    if(err){ const el=$('#err'); el.textContent=err; el.hidden=false; return; }  // chybu ukážeme ve formuláři
    save(); dlg.close(); render();
  };
  dlg.showModal();
}
const field = (name,label,val='',type='text',extra='') => `<label for="f_${name}">${label}</label><input id="f_${name}" name="${name}" type="${type}" value="${esc(val)}" ${extra}>`;

// --- Kniha: přidání a úprava ---
function bookForm(b){
  form(b ? 'Upravit knihu' : 'Nová kniha',
    field('title','Název',b?.title) + field('author','Autor',b?.author) +
    `<div class="row">${field('isbn','ISBN (13 znaků)',b?.isbn,'text','maxlength="13" inputmode="numeric"')}${field('copies','Dostupné výtisky',b?.available_copies ?? 1,'number','min="0" step="1"')}</div>`,
    'Uložit knihu', d => {
      d.isbn = d.isbn.trim();
      const err = validateBook(d, b?.id); if(err) return err;
      const data = {title:d.title.trim(), author:d.author.trim(), isbn:d.isbn, available_copies:Number(d.copies)};
      if(b) Object.assign(b, data); else db.books.push({id:nextId(), ...data});
      toast('Kniha uložena'); return '';
    });
}
// --- Čtenář: přidání a úprava ---
function readerForm(r){
  form(r ? 'Upravit čtenáře' : 'Nový čtenář', field('name','Jméno',r?.name) + field('email','E-mail',r?.email,'email'),
    'Uložit čtenáře', d => {
      d.name = d.name.trim(); d.email = d.email.trim();
      const err = validateReader(d); if(err) return err;
      if(r) Object.assign(r, d); else db.readers.push({id:nextId(), ...d});
      toast('Čtenář uložen'); return '';
    });
}
// --- Nová výpůjčka (volitelně s předvybranou knihou z detailu) ---
function loanForm(bookId){
  if(!db.readers.length){ toast('Nejdřív přidejte čtenáře'); return; }
  const now = new Date(), due = new Date(Date.now() + 14*864e5);   // výchozí lhůta 14 dní
  const bookOpts = db.books.map(b => `<option value="${b.id}" ${b.id===bookId?'selected':''} ${b.available_copies<1?'disabled':''}>${esc(b.title)} (${b.available_copies} ks)</option>`).join('');
  const readerOpts = db.readers.map(r => `<option value="${r.id}">${esc(r.name)}</option>`).join('');
  form('Půjčit knihu',
    `<label for="f_book">Kniha</label><select id="f_book" name="book">${bookOpts}</select>
     <label for="f_reader">Čtenář</label><select id="f_reader" name="reader">${readerOpts}</select>
     <div class="row">${field('borrowed','Půjčeno',toLocalInput(now),'datetime-local')}${field('due','Vrátit do',toLocalInput(due),'datetime-local')}</div>`,
    'Půjčit', d => {
      const loan = {book_id:Number(d.book), reader_id:Number(d.reader), borrowed_at:d.borrowed, due_at:d.due};
      const err = validateLoan(loan); if(err) return err;
      // Ukládáme jako ISO čas, aby šlo spolehlivě porovnávat.
      db.loans.push({id:nextId(), ...loan, borrowed_at:new Date(d.borrowed).toISOString(), due_at:new Date(d.due).toISOString(), returned_at:null});
      bookOf(loan.book_id).available_copies--;       // půjčením ubývá dostupný výtisk
      toast('Výpůjčka založena'); return '';
    });
}
// --- Detail knihy se seznamem všech jejích výpůjček ---
function bookDetail(id){
  const b = bookOf(id), loans = db.loans.filter(l => l.book_id === id);
  dlg.innerHTML = `<h2>${esc(b.title)}</h2><p class="mut">${esc(b.author)} · ISBN ${esc(b.isbn)} · dostupné ${b.available_copies} ks</p>
    <h3 style="font-size:16px;margin:14px 0 8px">Výpůjčky (${loans.length})</h3>
    <div class="tbl" style="max-height:260px;overflow:auto"><table style="min-width:480px"><thead><tr><th>Čtenář</th><th>Půjčeno</th><th>Termín</th><th>Stav</th><th></th></tr></thead>
    <tbody>${loanRows(loans,false)}</tbody></table>${loans.length?'':'<div class="empty">Tuto knihu si zatím nikdo nepůjčil.</div>'}</div>
    <div class="foot"><button class="btn" data-close>Zavřít</button>
    <button class="btn primary" data-act="loan-book" data-id="${id}" ${b.available_copies<1?'disabled':''}>Půjčit tuto knihu</button></div>`;
  dlg.showModal();
}
