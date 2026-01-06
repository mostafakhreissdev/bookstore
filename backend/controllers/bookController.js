const db = require("../config/db");

exports.getBooks = (req, res) => {
  db.query("SELECT * FROM books", (err, data) => {
    res.json(data);
  });
};

exports.addBook = (req, res) => {
  const { title, author, price, image } = req.body;
  db.query(
    "INSERT INTO books (title, author, price, image) VALUES (?, ?, ?, ?)",
    [title, author, price, image || ""],
    () => res.json("Book added")
  );
};

exports.updateBook = (req, res) => {
  const { title, author, price, image } = req.body;
  db.query(
    "UPDATE books SET title=?, author=?, price=?, image=? WHERE id=?",
    [title, author, price, image || "", req.params.id],
    () => res.json("Book updated")
  );
};

exports.deleteBook = (req, res) => {
  db.query("DELETE FROM books WHERE id=?", [req.params.id], () =>
    res.json("Book deleted")
  );
};
