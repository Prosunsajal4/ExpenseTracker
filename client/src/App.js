import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, transactions: 0 });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash',
    tags: []
  });
  const [filter, setFilter] = useState({ type: 'all', startDate: '', endDate: '' });
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = '/api';

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [filter]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter.type && filter.type !== 'all') queryParams.append('type', filter.type);
      if (filter.startDate) queryParams.append('startDate', filter.startDate);
      if (filter.endDate) queryParams.append('endDate', filter.endDate);
      const queryString = queryParams.toString();
      const url = API_BASE_URL + '/transactions' + (queryString ? '?' + queryString : '');
      const response = await axios.get(url);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(API_BASE_URL + '/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(API_BASE_URL + '/transactions', formData);
      setShowForm(false);
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'cash',
        tags: []
      });
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      setIsLoading(true);
      try {
        await axios.delete(API_BASE_URL + '/transactions/' + id);
        fetchTransactions();
        fetchStats();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getChartData = () => {
    const grouped = {};
    transactions.forEach(t => {
      const date = format(new Date(t.date), 'MMM dd');
      if (!grouped[date]) grouped[date] = { income: 0, expense: 0 };
      grouped[date][t.type] += t.amount;
    });
    return Object.entries(grouped).slice(-7).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense
    }));
  };

  const getPieChartData = () => {
    const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };

  const getPaymentIcon = (method) => {
    const icons = { cash: '💵', card: '💳', bank: '🏦', digital: '📱' };
    return icons[method] || '💰';
  };

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(18, 18, 26, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '12px 16px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '6px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '0.85rem', fontWeight: 600 }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Monitor your finances in real-time</p>
      </header>

      <section className="dashboard">
        <div className="stats-grid">
          <motion.div className="stat-card" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <div className="stat-icon income">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <h3>Total Income</h3>
            <div className="stat-value income">{formatCurrency(stats.totalIncome)}</div>
          </motion.div>

          <motion.div className="stat-card" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <div className="stat-icon expense">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
            <h3>Total Expense</h3>
            <div className="stat-value expense">{formatCurrency(stats.totalExpense)}</div>
          </motion.div>

          <motion.div className="stat-card" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <div className="stat-icon balance">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3>Net Balance</h3>
            <div className={'stat-value ' + (stats.balance >= 0 ? 'positive' : 'negative')}>
              {formatCurrency(stats.balance)}
            </div>
          </motion.div>

          <motion.div className="stat-card" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <div className="stat-icon count">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3>Transactions</h3>
            <div className="stat-value" style={{color: 'var(--purple)'}}>{stats.transactions}</div>
          </motion.div>
        </div>

        <div className="controls">
          <button onClick={() => setShowForm(!showForm)} className="add-btn" disabled={isLoading}>
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>

          <div className="filters">
            <select value={filter.type} onChange={(e) => setFilter({...filter, type: e.target.value})}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="date" value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})} />
            <input type="date" value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})} />
            <button onClick={() => setFilter({ type: 'all', startDate: '', endDate: '' })}>Clear</button>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div className="transaction-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <h2>Add New Transaction</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g., Food, Salary, Bills" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" step="0.01" required />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="What was this for?" required />
                  </div>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="digital">Digital Wallet</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Transaction'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="charts-section">
          <div className="chart-container">
            <h3>Income vs Expense</h3>
            {getChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getChartData()} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data yet</div>
            )}
          </div>
          <div className="chart-container">
            <h3>Expenses by Category</h3>
            {getPieChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={getPieChartData()} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}
                    labelLine={false}>
                    {getPieChartData().map((entry, index) => (
                      <Cell key={'cell-' + index} fill={colors[index % colors.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No expenses yet</div>
            )}
          </div>
        </div>

        <div className="transactions-section">
          <h2>Recent Transactions</h2>
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="no-transactions">No transactions found. Add your first one above!</div>
          ) : (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {transactions.map((transaction) => (
                      <motion.tr key={transaction._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                        <td><span className={'type-badge ' + transaction.type}>{transaction.type}</span></td>
                        <td style={{fontWeight: 500, color: 'var(--text-primary)'}}>{transaction.category}</td>
                        <td>{transaction.description}</td>
                        <td className={'amount ' + transaction.type}>{formatCurrency(transaction.amount)}</td>
                        <td>{getPaymentIcon(transaction.paymentMethod)} {transaction.paymentMethod}</td>
                        <td>
                          <button onClick={() => handleDelete(transaction._id)} className="delete-btn" disabled={isLoading}>Delete</button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;