# Expense Tracker Application

## Overview

A modern, full-stack expense tracker application with real-time balance calculation, transaction management, and interactive data visualization.

## Project Structure

```
ExpenseTracker/
├── client/
│   ├── package.json
│   └── src/
│       ├── App.js             # Main React application
│       ├── App.css            # Styling
│       ├── index.js           # React entry point
│       ├── components/        # Reusable components
│       ├── store.js          # Application state
│       └── routes.js          # Navigation setup
├── server/
│   └── index.js              # Express API backend
├── package.json               # Main package configuration
├── .env                       # Environment variables
└── vercel.json                # Vercel deployment config
```

## Technology Stack

### Backend (Node.js/Express)
- Express.js - Web framework
- MongoDB - Database (Atlas cluster)
- Mongoose - MongoDB ODM
- Helmet - Security middleware
- CORS - Cross-origin requests
- Dotenv - Environment variables
- Morgan - HTTP logging

### Frontend (React)
- React 18+ - UI library
- Axios - HTTP requests
- Recharts - Data visualization
- Framer Motion - Animations
- Date-fns - Date formatting
- Lodash - Utility functions

## Features

✅ **Transaction Management**
- Add income and expense transactions
- Complete CRUD operations
- Detailed transaction history

✅ **Dynamic Balance Calculation**
- Real-time net balance (Income - Expense)
- Period-based statistics (week, month, year)
- Automated calculations

✅ **MongoDB Integration**
- Atlas cluster connected
- Transaction schema with validation
- Full database operations

✅ **Transaction History**
- Filter by type and date range
- Search and sort capabilities
- Responsive data table

✅ **Responsive Dashboard UI**
- Modern, clean design
- Mobile-first approach
- Interactive charts

## Deployment

### Vercel Deployment

The application is configured for deployment on Vercel using the monorepo approach:

1. **Root Package Scripts**
   ```bash
   npm run vercel-build    # For Vercel builds
   npm run dev             # For local development
   ```

2. **Vercel Configuration**
   - Serverless functions for API routes (`/api/*`)
   - Static hosting for frontend
   - Environment variables configured

3. **Deployment Steps**
   ```bash
   # Deploy backend to Vercel
   vercel --prod
   
   # The API will be available at your-vercel-url.vercel.app/api
   # The frontend will be at your-vercel-url.vercel.app
   ```

## Configuration

### Environment Variables (`.env`)
```bash
MONGO_URI=mongodb+srv://AccessUser:6uv33P9ydsh93VRi@prosun.7xdyt.mongodb.net/fitfat?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### Database Schema
```javascript
Transaction Schema:
- type: 'income' | 'expense'
- category: String (required)
- amount: Number (required)
- description: String (required)
- date: Date
- paymentMethod: 'cash' | 'card' | 'bank' | 'digital'
- tags: [String]
```

## Development

### Local Setup
```bash
# Install dependencies
npm run install

# Start development server
npm run dev

# Visit http://localhost:5000
```

### API Endpoints
```bash
GET    /api/transactions     # Get all transactions (with optional query params)
POST   /api/transactions     # Create new transaction
DELETE /api/transactions/:id # Delete transaction by ID
GET    /api/stats            # Get balance and statistics (with period filter)
```

## Usage

### Adding Transactions
Users can add transactions through the UI with fields for:
- Transaction type (Income/Expense)
- Category and amount
- Date and description
- Payment method (Cash, Card, Bank, Digital Wallet)

### Viewing Data
- Dashboard shows real-time balance and statistics
- Transaction history with filtering options
- Visual charts displaying trends and category breakdown
- Exportable data in various formats

## Production Considerations

1. **Environment Variables**
   - Ensure proper MongoDB connection string
   - Set appropriate port for production

2. **Database Management**
   - Regular backups of MongoDB data
   - Connection pooling for performance

3. **Security**
   - Rate limiting on API endpoints
   - Input validation and sanitization
   - CORS configuration for trusted domains

4. **Performance**
   - MongoDB indexing for frequently queried fields
   - Caching for frequently accessed data
   - CDN for static assets

## Verification

### Testing Steps
1. Run the application: `npm run dev`
2. Test API endpoints with:
   ```bash
   # GET all transactions
   curl http://localhost:5000/api/transactions
   
   # Add a transaction
   curl -X POST http://localhost:5000/api/transactions \
     -H "Content-Type: application/json" \
     -d '{"type":"income","category":"salary","amount":5000,"description":"Monthly salary","date":"2024-01-01","paymentMethod":"bank","tags":["monthly"]}'
   
   # Get statistics
   curl http://localhost:5000/api/stats
   ```
3. Verify deployment with Vercel CLI or dashboard

### Monitoring
- API health checks
- Database connection monitoring
- Error tracking and logging
- Performance metrics and analytics

## License

This project is part of the Expense Tracker Application suite.

## Notes

- The application is currently in development
- Additional features may be added in future iterations
- API rate limiting and advanced security features are planned for production
- Mobile-responsive design ensures optimal experience across devices

## Contact Support

For issues, feature requests, or additional assistance:
- Check GitHub issues for existing known issues
- Submit new issues with detailed reproduction steps
- Review documentation for troubleshooting guides