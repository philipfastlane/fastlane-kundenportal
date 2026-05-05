const express = require('express');
const adminAuth = require('../../middleware/adminAuth');
const db = require('../../database');

const router = express.Router();
router.use(adminAuth);

router.get('/', (req, res) => {
  const customers   = db.prepare('SELECT COUNT(*) as c FROM customers').get().c;
  const contracts   = db.prepare("SELECT COUNT(*) as c FROM contracts WHERE status = 'aktiv'").get().c;
  const invOpen     = db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as t FROM invoices WHERE status != 'bezahlt'").get();
  const invOverdue  = db.prepare("SELECT COUNT(*) as c FROM invoices WHERE status = 'überfällig'").get().c;
  const tickOpen    = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE status NOT IN ('gelöst','geschlossen')").get().c;
  const recentTickets = db.prepare(`
    SELECT t.*, c.name as customer_name, c.company as customer_company
    FROM tickets t LEFT JOIN customers c ON t.customer_id = c.id
    ORDER BY t.created_at DESC LIMIT 6
  `).all();
  const recentCustomers = db.prepare('SELECT id, name, company, email, created_at FROM customers ORDER BY created_at DESC LIMIT 5').all();

  res.json({
    customers,
    activeContracts: contracts,
    openInvoices: invOpen.c,
    openInvoicesTotal: invOpen.t,
    overdueInvoices: invOverdue,
    openTickets: tickOpen,
    recentTickets,
    recentCustomers,
  });
});

module.exports = router;
