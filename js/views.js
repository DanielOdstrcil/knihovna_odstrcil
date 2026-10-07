/* =====================================================================
   Stav rozhraní a vykreslování záložek (knihy, čtenáři, výpůjčky)
   Soubor je součástí aplikace Knihovna a výpůjčky (viz README.md).
   ===================================================================== */

/* ---------- 4) STAV UI ---------- */
const ui = { tab:'books', q:'', loanFilter:'all' };
const TABS = [['books','Knihy'],['readers','Čtenáři'],['loans','Výpůjčky']];

// Vykreslí hřbety knih v hlavičce (čistě dekorace, barvy a výšky jsou pevné).
$('#spines').innerHTML = [['#1F6F5C',38],['#E0A526',48],['#C4503F',32],['#5B8DEF',44],['#8E6BBF',36]]
  .map(([c,h]) => `<i style="background:${c};height:${h}px"></i>`).join('');

/* ---------- 5) HLAVNÍ VYKRESLENÍ ---------- */
function render(){
  const late = db.loans.filter(isOverdue).length;   // počet výpůjček po termínu pro odznak
  $('#nav').innerHTML = TABS.map(([k,n]) =>
    `<button role="tab" data-tab="${k}" aria-selected="${ui.tab===k}">${n}${k==='loans'&&late?`<span class="badge">${late}</span>`:''}</button>`).join('');
  $('#view').innerHTML = ({books:viewBooks, readers:viewReaders, loans:viewLoans})[ui.tab]();
}

/* --- 5a) KNIHY: seznam + filtr podle názvu nebo autora --- */
function viewBooks(){
  const q = ui.q.trim().toLowerCase();
  const list = db.books.filter(b => !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  const rows = list.map(b => `<tr>
    <td><button class="title" data-act="detail" data-id="${b.id}">${esc(b.title)}</button><div class="mut">${esc(b.author)}</div></td>
    <td class="mut">${esc(b.isbn)}</td>
    <td><span class="tag ${b.available_copies?'':'zero'}">${b.available_copies} ks</span></td>
    <td><div class="acts">
      <button class="btn sm" data-act="detail" data-id="${b.id}">Detail</button>
      <button class="btn sm" data-act="edit-book" data-id="${b.id}">Upravit</button>
      <button class="btn sm danger" data-act="del-book" data-id="${b.id}">Smazat</button></div></td></tr>`).join('');
  return `<div class="bar"><h2>Knihy</h2>
    <input class="search" id="q" type="search" placeholder="Hledat název nebo autora" value="${esc(ui.q)}" aria-label="Filtr knih">
    <button class="btn primary" data-act="new-book">Přidat knihu</button></div>
    <div class="tbl"><table><thead><tr><th>Kniha</th><th>ISBN</th><th>Dostupné</th><th></th></tr></thead>
    <tbody>${rows || ''}</tbody></table>
    ${list.length ? '' : '<div class="empty">Žádná kniha neodpovídá. Zkuste jiný výraz nebo přidejte novou knihu.</div>'}</div>`;
}

/* --- 5b) ČTENÁŘI --- */
function viewReaders(){
  const rows = db.readers.map(r => {
    const n = db.loans.filter(l => l.reader_id===r.id && isActive(l)).length;  // kolik knih má právě půjčeno
    return `<tr><td><b>${esc(r.name)}</b></td><td class="mut">${esc(r.email)}</td>
      <td>${n ? `<span class="tag">${n} půjčeno</span>` : '<span class="mut">nic</span>'}</td>
      <td><div class="acts"><button class="btn sm" data-act="edit-reader" data-id="${r.id}">Upravit</button>
      <button class="btn sm danger" data-act="del-reader" data-id="${r.id}">Smazat</button></div></td></tr>`;
  }).join('');
  return `<div class="bar"><h2>Čtenáři</h2><button class="btn primary" data-act="new-reader">Přidat čtenáře</button></div>
    <div class="tbl"><table><thead><tr><th>Jméno</th><th>E-mail</th><th>Výpůjčky</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    ${db.readers.length ? '' : '<div class="empty">Zatím žádní čtenáři. Přidejte prvního, než založíte výpůjčku.</div>'}</div>`;
}

/* --- 5c) VÝPŮJČKY: filtr, vrácení, zvýraznění po termínu --- */
function loanRows(loans, withBook = true){
  return loans.slice().sort((a,b) => b.borrowed_at.localeCompare(a.borrowed_at)).map(l => {
    const late = isOverdue(l);
    const stav = l.returned_at ? `<span class="tag done">vráceno ${fmt(l.returned_at)}</span>`
               : late ? '<span class="tag late">po termínu</span>' : '<span class="tag">půjčeno</span>';
    return `<tr class="${late?'late':''}">
      ${withBook ? `<td><button class="title" data-act="detail" data-id="${l.book_id}">${esc(bookOf(l.book_id)?.title ?? '?')}</button></td>` : ''}
      <td>${esc(readerOf(l.reader_id)?.name ?? '?')}</td>
      <td class="mut">${fmt(l.borrowed_at)}</td><td class="mut">${fmt(l.due_at)}</td><td>${stav}</td>
      <td><div class="acts">${isActive(l) ? `<button class="btn sm" data-act="return" data-id="${l.id}">Vrátit</button>` : ''}</div></td></tr>`;
  }).join('');
}
function viewLoans(){
  const f = ui.loanFilter;
  const list = db.loans.filter(l => f==='all' || (f==='active'&&isActive(l)) || (f==='late'&&isOverdue(l)) || (f==='done'&&!isActive(l)));
  const chip = (k,n) => `<button class="chip" data-filter="${k}" aria-pressed="${f===k}">${n}</button>`;
  return `<div class="bar"><h2>Výpůjčky</h2>
    <div class="chips">${chip('all','Všechny')}${chip('active','Aktivní')}${chip('late','Po termínu')}${chip('done','Vrácené')}</div>
    <button class="btn primary" data-act="new-loan">Půjčit knihu</button></div>
    <div class="tbl"><table><thead><tr><th>Kniha</th><th>Čtenář</th><th>Půjčeno</th><th>Termín</th><th>Stav</th><th></th></tr></thead>
    <tbody>${loanRows(list)}</tbody></table>
    ${list.length ? '' : '<div class="empty">V tomto filtru nejsou žádné výpůjčky.</div>'}</div>`;
}
