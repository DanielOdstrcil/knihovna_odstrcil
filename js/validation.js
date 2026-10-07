/* =====================================================================
   Validační pravidla ze zadání
   Soubor je součástí aplikace Knihovna a výpůjčky (viz README.md).
   ===================================================================== */

/* ---------- 3) VALIDACE (povinná pravidla ze zadání) ---------- */
// Každá funkce vrací text chyby, nebo '' když je vše v pořádku.

// Pravidla pro knihu: ISBN jedinečné + 13 znaků, available_copies celé číslo >= 0.
function validateBook(d, editId){
  if(!d.title.trim())  return 'Vyplňte název knihy.';
  if(!d.author.trim()) return 'Vyplňte autora.';
  if(d.isbn.length !== 13) return 'ISBN musí mít přesně 13 znaků (nyní ' + d.isbn.length + ').';
  if(db.books.some(b => b.isbn === d.isbn && b.id !== editId)) return 'Kniha s tímto ISBN už existuje.';
  if(!/^\d+$/.test(d.copies) || Number(d.copies) < 0) return 'Počet výtisků musí být celé číslo, nejméně 0.';
  return '';
}
// Pravidla pro čtenáře (jen základní kontrola vyplnění a tvaru e-mailu).
function validateReader(d){
  if(!d.name.trim()) return 'Vyplňte jméno čtenáře.';
  if(!/^\S+@\S+\.\S+$/.test(d.email)) return 'Zadejte platný e-mail.';
  return '';
}
// Pravidla pro výpůjčku: dostupný výtisk, due_at > borrowed_at, žádná duplicitní aktivní výpůjčka.
function validateLoan(d){
  const book = bookOf(d.book_id);
  if(!book) return 'Vyberte knihu.';
  if(!readerOf(d.reader_id)) return 'Vyberte čtenáře.';
  if(book.available_copies < 1) return 'Kniha nemá žádný dostupný výtisk.';
  if(!d.borrowed_at || !d.due_at) return 'Vyplňte obě data.';
  if(new Date(d.due_at) <= new Date(d.borrowed_at)) return 'Termín vrácení musí být později než datum půjčení.';
  // Stejnou knihu nelze jednomu čtenáři půjčit podruhé, dokud ji nevrátil.
  if(db.loans.some(l => l.book_id===d.book_id && l.reader_id===d.reader_id && isActive(l)))
    return 'Tento čtenář už má tuto knihu půjčenou a zatím ji nevrátil.';
  return '';
}
