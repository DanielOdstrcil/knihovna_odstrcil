/* =====================================================================
   Ukládání dat (localStorage) a ukázková data
   Soubor je součástí aplikace Knihovna a výpůjčky (viz README.md).
   ===================================================================== */

/* Datový model přesně podle zadání:
     Book  : id, title, author, isbn, available_copies
     Reader: id, name, email
     Loan  : id, book_id, reader_id, borrowed_at, due_at, returned_at
   (id je navíc – bez primárního klíče by nešlo vést vazby book_id / reader_id)
   Data žijí v prohlížeči (localStorage). */

/* ---------- 1) ÚLOŽIŠTĚ DAT ---------- */
const KEY = 'knihovna_v1';
let db = load();   // celá "databáze": { books:[], readers:[], loans:[], seq:číslo }

// Načte data z localStorage; když nic není (nebo je storage zablokované), vytvoří ukázková data.
function load(){
  try{ const d = JSON.parse(localStorage.getItem(KEY)); if(d && d.books) return d; }catch(e){}
  return {
    seq: 10,
    books: [
      {id:1,title:'Krakatit',author:'Karel Čapek',isbn:'9788072037162',available_copies:2},
      {id:2,title:'Saturnin',author:'Zdeněk Jirotka',isbn:'9788020422347',available_copies:1},
      {id:3,title:'Válka s mloky',author:'Karel Čapek',isbn:'9788025700761',available_copies:0}
    ],
    readers: [
      {id:4,name:'Jana Nováková',email:'jana.novakova@example.cz'},
      {id:5,name:'Petr Svoboda',email:'petr.svoboda@example.cz'}
    ],
    loans: []
  };
}
// Uloží celou databázi (voláme po každé změně).
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(db)); }catch(e){} }
// Nové jedinečné ID pro libovolnou entitu.
const nextId = () => ++db.seq;
