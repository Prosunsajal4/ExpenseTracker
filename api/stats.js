const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

let cached = null;

async function connectDB() {
  if (cached) return cached;
  cached = mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return cached;
}

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank', 'digital'], required: true },
  tags: [{ type: String }]
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    await connectDB();
    try {
      const { period = 'month' } = req.query;
      let dateFilter = {};
      const now = new Date();

      switch (period) {
        case 'week': {
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          dateFilter.date = { $gte: weekStart };
          break;
        }
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter.date = { $gte: monthStart };
          break;
        }
        case 'year': {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          dateFilter.date = { $gte: yearStart };
          break;
        }
      }

      const transactions = await Transaction.find(dateFilter);

      const stats = {
        totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        balance: 0,
        transactions: transactions.length
      };

      stats.balance = stats.totalIncome - stats.totalExpense;

      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};