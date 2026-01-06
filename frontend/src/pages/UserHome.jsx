import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaShoppingCart, FaSearch } from "react-icons/fa";

export default function UserHome() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredBooks(books);
    } else {
      const lower = search.toLowerCase();
      setFilteredBooks(
        books.filter(
          (book) =>
            book.title.toLowerCase().includes(lower) ||
            book.author.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, books]);

  const fetchBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (book) => setCart((prev) => [...prev, book]);
  const removeFromCart = (index) =>
    setCart((prev) => prev.filter((_, i) => i !== index));

  const checkout = async () => {
    if (!token) return alert("You must be logged in to checkout");
    if (cart.length === 0) return alert("Cart is empty");

    try {
      const cartItems = cart.map((book) => ({ bookId: book.id }));
      await api.post(
        "/orders",
        { cart: cartItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order placed successfully!");
      setCart([]);
      setCartOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to place order");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const total = cart.reduce((acc, item) => acc + Number(item.price), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50">
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
          <h1 className="text-xl md:text-2xl font-bold">Book Store</h1>
          {userEmail && (
            <div className="ml-4 flex items-center space-x-3">
              <p className="text-gray-700 text-sm md:text-base">
                Logged in as: <span className="font-semibold">{userEmail}</span>
              </p>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-1/3 my-2 md:my-0">
          <input
            type="text"
            placeholder="Search by title or author..."
            className="w-full border rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Cart */}
        <div className="relative">
          <button
            className="relative text-gray-700 ml-0 md:ml-4"
            onClick={() => setCartOpen((prev) => !prev)}
          >
            <FaShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          {cartOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded p-4 z-50">
              <h2 className="text-xl font-semibold mb-2">Your Cart</h2>
              {cart.length === 0 ? (
                <p className="text-gray-500">Cart is empty</p>
              ) : (
                <>
                  <ul className="mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center border-b py-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-gray-500 text-sm">${item.price}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-600 ml-2"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold mb-2">
                    Total: ${total.toFixed(2)}
                  </p>
                  <button
                    onClick={checkout}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                  >
                    Checkout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Books Grid */}
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Available Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              <button
                onClick={() => addToCart(book)}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
              >
                Add to Cart
              </button>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No books match your search
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
