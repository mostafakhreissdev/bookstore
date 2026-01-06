const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    (err) => {
      if (err) {
        // Duplicate email
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }

        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ message: "User registered successfully" });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (result.length === 0) return res.status(401).json("User not found");

      const valid = await bcrypt.compare(password, result[0].password);
      if (!valid) return res.status(401).json("Invalid password");

      const token = jwt.sign(
        { id: result[0].id, role: result[0].role },
        process.env.JWT_SECRET
      );

      res.json({ token, role: result[0].role });
    }
  );
};
