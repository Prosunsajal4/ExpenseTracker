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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'DELETE') {
    await connectDB();
    try {
      const { id } = req.query;
      await Transaction.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
};