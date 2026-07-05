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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const { type, startDate, endDate } = req.query;
      let filter = {};

      if (type && type !== 'all') {
        filter.type = type;
      }

      if (startDate && endDate) {
        filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const transactions = await Transaction.find(filter).sort({ date: -1 });
      return res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const transaction = new Transaction(req.body);
      const saved = await transaction.save();
      return res.status(201).json(saved);
    } catch (error) {
      return res.status(400).json({ message: 'Error adding transaction', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};