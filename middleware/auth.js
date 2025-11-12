export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  req.user = { id: 'user-from-token', email: 'user@example.com', role: 'admin' };
  next();
}

export function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    req.user = { id: 'user-from-token', email: 'user@example.com', role: 'admin' };
  }

  next();
}

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  req.user = { id: 'user-from-token', email: 'user@example.com' };
  next();
}

export function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  req.user = { id: 'user-from-token', email: 'user@example.com', role: 'admin' };
  next();
}

export function verifyVendor(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  req.user = { id: 'user-from-token', email: 'user@example.com', role: 'vendor' };
  next();
}

export function verifyCustomer(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  req.user = { id: 'user-from-token', email: 'user@example.com', role: 'customer' };
  next();
}

