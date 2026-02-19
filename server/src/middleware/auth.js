import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, email: payload.email, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign({ id: user._id, email: user.email, username: user.username }, secret, {
    expiresIn: "7d"
  });
}

