# Dareon2.0 - Unified AI Workspace Assistant

Dareon2.0 is a powerful AI-driven workspace assistant that helps manage files, emails, calendars, and more through natural language commands and intelligent automation.

## Features

### 1. File Management
- Automatic file sorting by type, date, size, and name
- Recursive directory processing
- Duplicate file handling
- File categorization
- File statistics and reporting

### 2. Microsoft Integration
- Outlook email synchronization
- Calendar event management
- Contact management
- OneDrive file access and sharing
- Document synchronization

### 3. Gmail Integration
- Email synchronization
- Attachment handling
- Email search and organization
- Label management

### 4. Calendar Management
- TimeTree integration
- Cross-platform calendar sync
- Schedule coordination
- Event management

### 5. AI Assistant
- Natural language processing
- Context-aware conversations
- Intent recognition
- Command processing
- Error handling and recovery

### 6. Security Features
- Secure authentication
- API key management
- Token handling
- Error logging
- Secure data transmission

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Formik & Yup
- Axios
- Font Awesome

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Stripe Integration
- Various API integrations (Microsoft Graph, Gmail, TimeTree)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dareon2.git
cd dareon2
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values.

5. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Project Structure

```
dareon2/
├── frontend/           # React frontend
│   ├── public/        # Static files
│   └── src/           # Source files
│       ├── components/# Reusable components
│       ├── pages/     # Page components
│       ├── services/  # API services
│       └── styles/    # CSS styles
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   └── utils/       # Utility functions
│   └── config/       # Configuration files
```

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user

### File Management Endpoints
- POST `/api/files/upload` - Upload files
- GET `/api/files` - Get all files
- POST `/api/files/sort` - Sort files
- GET `/api/files/search` - Search files
- GET `/api/files/stats` - Get file statistics

### AI Assistant Endpoints
- POST `/api/ai/command` - Process natural language command
- GET `/api/ai/history` - Get command history
- GET `/api/ai/suggestions` - Get command suggestions

### Billing Endpoints
- GET `/api/billing/plans` - Get subscription plans
- POST `/api/billing/subscribe` - Create subscription
- PUT `/api/billing/subscription` - Update subscription
- DELETE `/api/billing/subscription` - Cancel subscription

## Subscription Plans

### Free Trial (14 days)
- Basic file management
- Up to 1GB storage
- Email integration
- Calendar sync

### Basic Plan ($9.99/month)
- Advanced file management
- Up to 10GB storage
- Email & calendar integration
- Basic AI features
- Priority support

### Premium Plan ($29.99/month)
- Enterprise file management
- Up to 100GB storage
- Full integration suite
- Advanced AI features
- 24/7 Priority support
- Custom API access

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@dareon2.com or visit our [help center](https://help.dareon2.com).
