import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [editBookId, setEditBookId] = useState(null);
  const [search, setSearch] = useState("");
  const formRef = useRef();

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch books
  const fetchBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books by search
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  // Add book
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/books", { title, author, price, image });
      setTitle("");
      setAuthor("");
      setPrice("");
      setImage("");
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add book");
    }
  };

  // Delete book
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete book");
    }
  };

  // Edit book
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/books/${editBookId}`, { title, author, price, image });
      setEditBookId(null);
      setTitle("");
      setAuthor("");
      setPrice("");
      setImage("");
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update book");
    }
  };

  // Start editing a book
  const startEdit = (book) => {
    setEditBookId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(book.price);
    setImage(book.image);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:gap-0 md:items-center md:justify-between">
          {/* Logo */}
          <h1 className="text-xl md:text-2xl font-bold text-center md:text-left">
            Your Store
          </h1>

          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by title or author..."
              className="w-full border rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate("/admin/orders")}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              View Orders
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Book Form */}
        <form
          ref={formRef}
          onSubmit={editBookId ? handleEdit : handleAdd}
          className="mb-6 bg-white p-4 rounded shadow"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editBookId ? "Edit Book" : "Add Book"}
          </h2>

          <input
            placeholder="Title"
            className="border p-2 w-full mb-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            placeholder="Author"
            className="border p-2 w-full mb-2 rounded"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <input
            placeholder="Price"
            type="number"
            className="border p-2 w-full mb-2 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            placeholder="Image URL"
            className="border p-2 w-full mb-2 rounded"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded"
            >
              {editBookId ? "Update Book" : "Add Book"}
            </button>
            {editBookId && (
              <button
                type="button"
                onClick={() => {
                  setEditBookId(null);
                  setTitle("");
                  setAuthor("");
                  setPrice("");
                  setImage("");
                }}
                className="py-2 px-4 rounded border"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Books Grid */}
        <h2 className="text-2xl font-bold mb-4">Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded shadow p-4 flex flex-col justify-between"
            >
              <img
                src={
                  book.image && book.image.trim() !== ""
                    ? book.image
                    : "https://i.sstatic.net/y9DpT.jpg"
                }
                alt={book.title}
                className="w-full h-48 object-cover mb-4 rounded"
              />
              <div className="flex-1">
                <h2 className="font-bold text-lg">{book.title}</h2>
                <p className="text-gray-600">{book.author}</p>
                <p className="mt-2 text-green-600 font-semibold">
                  ${book.price}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => startEdit(book)}
                  className="bg-yellow-500 text-white py-1 px-2 rounded flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="bg-red-600 text-white py-1 px-2 rounded flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No books found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
