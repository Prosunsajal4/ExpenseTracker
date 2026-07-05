import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
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
    if (window.confirm('Are you sure you want to delete this transaction?')) {
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
    const incomeData = transactions.filter(t => t.type === 'income').reduce((acc, t) => {
      const date = format(new Date(t.date), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(incomeData).map(([date, amount]) => ({ date, amount }));
  };

  const getPieChartData = () => {
    const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Track your income and expenses</p>
      </header>

      <section className="dashboard">
        <div className="stats-grid">
          <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
            <h3>Total Income</h3>
            <p className="income">{formatCurrency(stats.totalIncome)}</p>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
            <h3>Total Expense</h3>
            <p className="expense">{formatCurrency(stats.totalExpense)}</p>
          </motion.div>
          <motion.div className="stat-card balance" whileHover={{ scale: 1.05 }}>
            <h3>Net Balance</h3>
            <p className={stats.balance >= 0 ? 'positive' : 'negative'}>{formatCurrency(stats.balance)}</p>
          </motion.div>
          <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
            <h3>Transactions</h3>
            <p>{stats.transactions}</p>
          </motion.div>
        </div>

        <div className="controls">
          <button onClick={() => setShowForm(!showForm)} className="add-btn" disabled={isLoading}>
            {showForm ? 'Cancel' : '+ Add Transaction'}
          </button>

          <div className="filters">
            <select value={filter.type} onChange={(e) => setFilter({...filter, type: e.target.value})}>
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
            <input type="date" value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})} />
            <input type="date" value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})} />
            <button onClick={() => setFilter({ type: 'all', startDate: '', endDate: '' })}>Clear Filters</button>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div className="transaction-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
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
                    <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Transaction description" required />
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
            <h3>Transaction Trend</h3>
            {getChartData().length > 0 ? (
              <BarChart width={600} height={300} data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            ) : (
              <div className="no-data">No transaction data available for chart</div>
            )}
          </div>
          <div className="chart-container">
            <h3>Expenses by Category</h3>
            {getPieChartData().length > 0 ? (
              <PieChart width={400} height={300}>
                <Pie data={getPieChartData()} cx={200} cy={150} outerRadius={100} fill="#8884d8" dataKey="value"
                  label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}>
                  {getPieChartData().map((entry, index) => (
                    <Cell key={'cell-' + index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="no-data">No expense data available for chart</div>
            )}
          </div>
        </div>

        <div className="transactions-section">
          <h2>Transaction History</h2>
          {isLoading ? (
            <div className="loading">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="no-transactions">No transactions found</div>
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
                    <th>Payment Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {transactions.map((transaction) => (
                      <motion.tr key={transaction._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                        <td><span className={'type-badge ' + transaction.type}>{transaction.type}</span></td>
                        <td>{transaction.category}</td>
                        <td>{transaction.description}</td>
                        <td className={'amount ' + transaction.type}>{formatCurrency(transaction.amount)}</td>
                        <td>{transaction.paymentMethod}</td>
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