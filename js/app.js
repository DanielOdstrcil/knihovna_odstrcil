/* =====================================================================
   Zpracování kliknutí a spuštění aplikace
   Soubor je součástí aplikace Knihovna a výpůjčky (viz README.md).
   ===================================================================== */

/* ---------- 7) AKCE (jedno místo pro všechna kliknutí) ---------- */
document.addEventListener('click', e => {
  if(e.target.closest('[data-close]')){ dlg.close(); return; }
  const tab = e.target.closest('[data-tab]'); if(tab){ ui.tab = tab.dataset.tab; render(); return; }
  const fl = e.target.closest('[data-filter]'); if(fl){ ui.loanFilter = fl.dataset.filter; render(); return; }
  const el = e.target.closest('[data-act]'); if(!el) return;
  const id = Number(el.dataset.id);
  switch(el.dataset.act){
    case 'new-book':    bookForm(); break;
    case 'edit-book':   bookForm(bookOf(id)); break;
    case 'detail':      bookDetail(id); break;
    case 'new-reader':  readerForm(); break;
    case 'edit-reader': readerForm(readerOf(id)); break;
    case 'new-loan':    loanForm(); break;
    case 'loan-book':   dlg.close(); loanForm(id); break;
    case 'del-book':
      // Knihu s nevrácenou výpůjčkou smazat nelze; historii vrácených výpůjček smažeme spolu s knihou.
      if(db.loans.some(l => l.book_id===id && isActive(l))) return toast('Kniha je půjčená, nejdřív ji vraťte');
      if(!confirm('Smazat knihu i její historii výpůjček?')) return;
      db.books = db.books.filter(b => b.id!==id); db.loans = db.loans.filter(l => l.book_id!==id);
      save(); render(); toast('Kniha smazána'); break;
    case 'del-reader':
      if(db.loans.some(l => l.reader_id===id && isActive(l))) return toast('Čtenář má nevrácené knihy');
      if(!confirm('Smazat čtenáře i jeho historii výpůjček?')) return;
      db.readers = db.readers.filter(r => r.id!==id); db.loans = db.loans.filter(l => l.reader_id!==id);
      save(); render(); toast('Čtenář smazán'); break;
    case 'return': {
      // Vrácení: zapíšeme returned_at a vrátíme výtisk mezi dostupné.
      const l = db.loans.find(x => x.id===id); l.returned_at = new Date().toISOString();
      bookOf(l.book_id).available_copies++;
      save(); render(); toast('Kniha vrácena');
      if(dlg.open) bookDetail(l.book_id);    // když jsme v detailu, hned ho obnovíme
      break; }
  }
});
// Filtr knih: filtruje při psaní a zachová kurzor v poli.
document.addEventListener('input', e => {
  if(e.target.id !== 'q') return;
  ui.q = e.target.value; render();
  const q = $('#q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length);
});

render();   // první vykreslení po načtení stránky
