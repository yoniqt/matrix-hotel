const jwt = require("jsonwebtoken");

function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated." });
  }

  try {
    req.admin = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired session." });
  }
}

module.exports = requireAdminAuth;
