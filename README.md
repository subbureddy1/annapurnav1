# Annapurna Web Application

A comprehensive pantry ordering system for employees with role-based access control.

## Features

- **Landing Page**: Rich interface highlighting app functionality
- **Authentication**: Signup, login, and forgot password functionality
- **Role-based Dashboards**: 
  - Customer dashboard for ordering items
  - Vendor dashboard for managing menu and orders
- **Real-time Notifications**: Order status updates
- **Order Management**: Complete order lifecycle from placement to completion

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT tokens
- **UI Components**: shadcn/ui

## Setup Instructions

### 1. Database Setup

1. Install MySQL and create a database:
\`\`\`sql
CREATE DATABASE annapurna_db;
\`\`\`

2. Run the schema from `database/schema.sql` to create tables and insert sample data.

### 2. Environment Configuration

1. Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Update the environment variables with your database credentials and JWT secret.

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Run the Application

\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:3000`.

## Usage

### For Customers:
1. Sign up with employee ID and account type "customer"
2. Login to access the customer dashboard
3. View available items for the day
4. Place orders from the dropdown menu
5. Receive notifications when orders are ready

### For Vendors:
1. Sign up with account type "vendor" (only one vendor allowed)
2. Login to access the vendor dashboard
3. Add items to today's menu with quantities
4. View and manage customer orders
5. Mark orders as ready to notify customers

## Database Schema

- **users**: Employee information and authentication
- **items**: Available food items
- **daily_items**: Items available for specific dates
- **orders**: Customer orders with status tracking
- **notifications**: Real-time notifications for users

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### User Management
- `GET /api/user/profile` - Get user profile

### Items
- `GET /api/items/all` - Get all items (vendor only)
- `GET /api/items/available` - Get available items for today
- `GET /api/items/daily` - Get vendor's daily items
- `POST /api/items/daily` - Add item to daily menu

### Orders
- `POST /api/orders/place` - Place new order
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/vendor` - Get vendor orders
- `PUT /api/orders/[id]/status` - Update order status

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]/read` - Mark notification as read

## Deployment

### Using Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Using Docker

1. Create a Dockerfile:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

2. Build and run:
\`\`\`bash
docker build -t annapurna-app .
docker run -p 3000:3000 annapurna-app
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
