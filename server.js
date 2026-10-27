import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, initDB } from './database.js';

initDB();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'papaws-secret-change-in-production';

app.use(express.json());
app.use(cookieParser());

function authToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// --- Auth ---
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (!['owner', 'chef', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, email, hash, role);
    const token = jwt.sign({ id: result.lastInsertRowid, name, email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: result.lastInsertRowid, name, email, role } });
  } catch (e) {
    res.status(400).json({ error: 'Email already registered' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/auth/me', authToken, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

// --- Menu ---
app.get('/api/menu', (_req, res) => {
  const items = db.prepare('SELECT * FROM menu_items WHERE is_available = 1').all();
  res.json(items);
});

app.post('/api/menu', authToken, requireRole('owner'), (req, res) => {
  const { name, category, description, price, original_price, discount_percent, image_url, is_available, prep_time_minutes, ingredients } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Name, category and price required' });
  }
  const result = db.prepare(`INSERT INTO menu_items
    (name, category, description, price, original_price, discount_percent, image_url, is_available, prep_time_minutes, ingredients)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(name, category, description || null, price, original_price || null, discount_percent || null, image_url || null, is_available !== undefined ? (is_available ? 1 : 0) : 1, prep_time_minutes || 15, ingredients || null);
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
  res.json(item);
});

app.put('/api/menu/:id', authToken, requireRole('owner'), (req, res) => {
  const { name, category, description, price, original_price, discount_percent, image_url, is_available, prep_time_minutes, ingredients } = req.body;
  db.prepare(`UPDATE menu_items SET name = COALESCE(?, name), category = COALESCE(?, category), description = COALESCE(?, description), price = COALESCE(?, price), original_price = COALESCE(?, original_price), discount_percent = COALESCE(?, discount_percent), image_url = COALESCE(?, image_url), is_available = COALESCE(?, is_available), prep_time_minutes = COALESCE(?, prep_time_minutes), ingredients = COALESCE(?, ingredients) WHERE id = ?`)
    .run(name, category, description, price, original_price, discount_percent, image_url, is_available !== undefined ? (is_available ? 1 : 0) : undefined, prep_time_minutes, ingredients, req.params.id);
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

app.delete('/api/menu/:id', authToken, requireRole('owner'), (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Discounts (Promo Offers) ---
app.get('/api/discounts', authToken, requireRole('owner'), (_req, res) => {
  const items = db.prepare('SELECT * FROM menu_items WHERE discount_percent IS NOT NULL AND discount_percent > 0').all();
  // Also check for promo offers table? Use discount_percent column as simple discount model
  res.json(items);
});

app.post('/api/discounts', authToken, requireRole('owner'), (req, res) => {
  const { menu_item_id, discount_percent } = req.body;
  if (!menu_item_id || !discount_percent) {
    return res.status(400).json({ error: 'menu_item_id and discount_percent required' });
  }
  db.prepare('UPDATE menu_items SET discount_percent = ? WHERE id = ?').run(discount_percent, menu_item_id);
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(menu_item_id);
  res.json(item);
});

app.delete('/api/discounts/:id', authToken, requireRole('owner'), (req, res) => {
  db.prepare('UPDATE menu_items SET discount_percent = NULL WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// --- Orders (all, for owner CMS) ---
app.get('/api/orders/all', authToken, requireRole('owner'), (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const ordersWithItems = rows.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    return { ...o, items };
  });
  res.json(ordersWithItems);
});

// --- Orders ---
app.get('/api/orders', authToken, (req, res) => {
  const { role } = req.user;
  let rows;
  if (role === 'customer') {
    rows = db.prepare('SELECT * FROM orders WHERE customer_name = ? ORDER BY created_at DESC').all(req.user.name);
  } else {
    rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  }
  const ordersWithItems = rows.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    return { ...o, items };
  });
  res.json(ordersWithItems);
});

app.post('/api/orders', authToken, (req, res) => {
  const { table_number, customer_name, items, subtotal, tax, grand_total, notes, priority } = req.body;
  if (!table_number || !items || items.length === 0) {
    return res.status(400).json({ error: 'Table and items required' });
  }
  const last = db.prepare('SELECT MAX(order_number) as n FROM orders').get().n || 100;
  const orderNumber = last + 1;
  const status = req.user.role === 'customer' ? 'awaiting_approval' : 'cooking';
  const insertOrder = db.prepare(`INSERT INTO orders
    (order_number, table_number, customer_name, customer_user_id, status, priority, notes, subtotal, tax, grand_total, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const result = insertOrder.run(orderNumber, table_number, customer_name || 'Guest', req.user.role === 'customer' ? req.user.id : null, status, priority || 'normal', notes || null, subtotal, tax, grand_total, req.user.name);
  const insertItem = db.prepare(`INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)`);
  for (const it of items) {
    insertItem.run(result.lastInsertRowid, it.menuItemId || null, it.name, it.price, it.quantity);
  }

  // Notify owner & chef of new order awaiting approval
  if (req.user.role === 'customer') {
    const staff = db.prepare("SELECT id FROM users WHERE role IN ('owner','chef')").all();
    const insNotif = db.prepare('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)');
    for (const u of staff) {
      insNotif.run(u.id, 'order', 'New Order Awaiting Approval', `Order #${orderNumber} for ${table_number} needs your approval`);
    }
  }

  res.json({ order: { id: result.lastInsertRowid, orderNumber, status } });
});

app.post('/api/orders/:id/approve', authToken, requireRole('owner'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'awaiting_approval') return res.status(400).json({ error: 'Order not awaiting approval' });
  db.prepare('UPDATE orders SET status = ?, cooking_started_at = CURRENT_TIMESTAMP WHERE id = ?').run('cooking', req.params.id);

  // Notify customer
  const insNotif = db.prepare('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)');
  if (order.customer_user_id) {
    insNotif.run(order.customer_user_id, 'order', 'Order Approved', `Your order #${order.order_number} has been approved and is being cooked!`);
  }

  res.json({ ok: true });
});

app.post('/api/orders/:id/reject', authToken, requireRole('owner'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', req.params.id);

  // Notify customer
  const insNotif = db.prepare('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)');
  if (order.customer_user_id) {
    insNotif.run(order.customer_user_id, 'order', 'Order Declined', `Your order #${order.order_number} was declined.`);
  }

  res.json({ ok: true });
});

app.post('/api/orders/:id/status', authToken, requireRole('chef'), (req, res) => {
  const { status } = req.body;
  if (!['cooking', 'ready', 'served'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (status === 'cooking') {
    db.prepare('UPDATE orders SET status = ?, cooking_started_at = CURRENT_TIMESTAMP WHERE id = ?').run('cooking', req.params.id);
  } else if (status === 'ready') {
    db.prepare('UPDATE orders SET status = ?, ready_at = CURRENT_TIMESTAMP WHERE id = ?').run('ready', req.params.id);
  } else if (status === 'served') {
    db.prepare('UPDATE orders SET status = ?, served_at = CURRENT_TIMESTAMP WHERE id = ?').run('served', req.params.id);
  }

  // Notify customer of status change
  const insNotif = db.prepare('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)');
  const title = status === 'ready' ? 'Order Ready' : status === 'served' ? 'Order Served' : 'Order Cooking';
  const msg = status === 'ready' ? `Your order #${order.order_number} is ready for pickup!` : status === 'served' ? `Your order #${order.order_number} has been served!` : `Your order #${order.order_number} is now being cooked.`;
  if (order.customer_user_id) {
    insNotif.run(order.customer_user_id, 'order', title, msg);
  }

  res.json({ ok: true });
});

// --- Notifications ---
app.get('/api/notifications', authToken, (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(rows);
});

app.post('/api/notifications/:id/read', authToken, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Papaw's API running on http://localhost:${PORT}`);
});
