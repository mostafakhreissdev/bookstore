const db = require("../config/db");

// Create order (checkout)
exports.createOrder = (req, res) => {
  const userId = req.user.id;
  const { cart } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Insert order
  db.query(
    "INSERT INTO orders (user_id) VALUES (?)",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const orderId = result.insertId;

      // Insert order items
      const values = cart.map((item) => [orderId, item.bookId]);

      db.query(
        "INSERT INTO order_items (order_id, book_id) VALUES ?",
        [values],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({ message: "Order created successfully", orderId });
        }
      );
    }
  );
};

// Get orders for a user
exports.getUserOrders = (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      orders.id AS order_id,
      orders.order_date,
      books.title
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN books ON books.id = order_items.book_id
    WHERE orders.user_id = ?
    ORDER BY orders.order_date DESC
  `;

  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

// Get order by ID
exports.getOrderById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      orders.id AS order_id,
      users.email,
      orders.order_date,
      books.title
    FROM orders
    JOIN users ON users.id = orders.user_id
    JOIN order_items ON orders.id = order_items.order_id
    JOIN books ON books.id = order_items.book_id
    WHERE orders.id = ?
  `;

  db.query(query, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};

// Admin: get all orders
exports.getAllOrders = (req, res) => {
  const query = `
    SELECT 
      orders.id AS order_id,
      users.email,
      orders.order_date,
      books.title,
      books.price
    FROM orders
    JOIN users ON users.id = orders.user_id
    JOIN order_items ON orders.id = order_items.order_id
    JOIN books ON books.id = order_items.book_id
    ORDER BY orders.order_date DESC
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json(err);

    // ✅ Group rows by order_id
    const ordersMap = {};

    rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          email: row.email,
          order_date: row.order_date,
          items: [],
        };
      }

      ordersMap[row.order_id].items.push({
        title: row.title,
        price: row.price,
      });
    });

    res.json(Object.values(ordersMap));
  });
};
