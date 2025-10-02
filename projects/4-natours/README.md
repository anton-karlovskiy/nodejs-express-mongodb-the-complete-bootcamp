# Natours - Adventure Tours Booking Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A comprehensive **adventure tours booking platform** built with Node.js, Express, and MongoDB. This full-stack application provides a complete ecosystem for managing outdoor adventure tours, user authentication, booking system, and payment processing.

## 🌟 Features

### Core Functionality
- **Tour Management**: Create, read, update, and delete adventure tours
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Booking System**: Complete booking workflow with Stripe payment integration
- **Review System**: User reviews and ratings for tours
- **Geospatial Features**: Find tours within specific distances using GPS coordinates
- **Image Upload**: Tour image management with Sharp for optimization
- **Email Notifications**: Automated email system for user communications

### Security Features
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Sanitization**: Protection against NoSQL injection and XSS attacks
- **Password Security**: Bcrypt hashing with secure password reset functionality
- **Helmet.js**: Security headers for enhanced protection
- **Input Validation**: Comprehensive data validation and sanitization

### Advanced Features
- **Geospatial Queries**: MongoDB geospatial indexing for location-based searches
- **Aggregation Pipelines**: Complex data analysis and statistics
- **Image Processing**: Automatic image resizing and optimization
- **Email Templates**: Professional HTML email templates
- **Error Handling**: Centralized error handling with custom error classes

## 🚀 Quick Start

### Prerequisites
- Node.js (v10.0.0 or higher)
- MongoDB (v5.x or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/natours.git
   cd natours
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp config.env.example config.env
   ```
   
   Update the following environment variables in `config.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE=mongodb://localhost:27017/natours
   DATABASE_PASSWORD=your_mongodb_password
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   EMAIL_USERNAME=your_email
   EMAIL_PASSWORD=your_email_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## 📁 Project Structure

```
natours/
├── controllers/          # Route controllers
│   ├── authController.js    # Authentication logic
│   ├── bookingController.js # Booking management
│   ├── tourController.js    # Tour operations
│   └── userController.js    # User management
├── models/              # MongoDB schemas
│   ├── tourModel.js        # Tour data model
│   ├── userModel.js        # User data model
│   ├── bookingModel.js     # Booking data model
│   └── reviewModel.js      # Review data model
├── routes/              # API routes
│   ├── tourRoutes.js       # Tour endpoints
│   ├── userRoutes.js       # User endpoints
│   ├── bookingRoutes.js    # Booking endpoints
│   └── reviewRoutes.js     # Review endpoints
├── views/               # Pug templates
│   ├── base.pug           # Base template
│   ├── overview.pug       # Tours overview
│   └── tour.pug          # Individual tour page
├── public/              # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── img/              # Images
├── utils/               # Utility functions
│   ├── appError.js        # Custom error classes
│   ├── catchAsync.js      # Async error handling
│   └── email.js          # Email utilities
├── app.js             # Express app configuration
└── server.js          # Server entry point
```

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/logout` - User logout
- `POST /api/v1/users/forgotPassword` - Password reset request
- `PATCH /api/v1/users/resetPassword/:token` - Password reset

### Tours
- `GET /api/v1/tours` - Get all tours (with filtering, sorting, pagination)
- `GET /api/v1/tours/:id` - Get specific tour
- `POST /api/v1/tours` - Create new tour (Admin/Lead Guide only)
- `PATCH /api/v1/tours/:id` - Update tour (Admin/Lead Guide only)
- `DELETE /api/v1/tours/:id` - Delete tour (Admin/Lead Guide only)
- `GET /api/v1/tours/top-5-cheap` - Get top 5 cheapest tours
- `GET /api/v1/tours/tour-stats` - Get tour statistics
- `GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit` - Find tours within distance

### Bookings
- `GET /api/v1/bookings/checkout-session/:tourId` - Create Stripe checkout session
- `GET /api/v1/bookings` - Get all bookings (Admin/Lead Guide only)
- `POST /api/v1/bookings` - Create booking (Admin/Lead Guide only)

### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/:id` - Get specific review
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Nodemailer** - Email service
- **Sharp** - Image processing
- **Multer** - File upload handling

### Frontend
- **Pug** - Template engine
- **CSS3** - Styling
- **JavaScript (ES6+)** - Client-side scripting
- **Mapbox** - Interactive maps
- **Axios** - HTTP client

### Security & Performance
- **Helmet.js** - Security headers
- **Express Rate Limit** - API rate limiting
- **Express Mongo Sanitize** - NoSQL injection protection
- **XSS Clean** - Cross-site scripting protection
- **HPP** - HTTP parameter pollution protection

## 🔒 Security Features

- **JWT Authentication** with secure cookie handling
- **Password encryption** using bcrypt with salt rounds
- **Rate limiting** to prevent API abuse
- **Data sanitization** against NoSQL injection
- **XSS protection** for cross-site scripting attacks
- **CSRF protection** through secure cookies
- **Input validation** and sanitization
- **Security headers** via Helmet.js

## 📊 Database Schema

### Tour Model
- Basic information (name, description, duration, difficulty)
- Pricing and discounts
- Location data with geospatial coordinates
- Images and media
- Ratings and reviews
- Tour guides and start dates

### User Model
- Authentication data (email, password)
- Profile information (name, photo)
- Role-based access control
- Password reset functionality

### Booking Model
- Tour and user references
- Payment information
- Booking status and timestamps

### Review Model
- Review text and rating
- Tour and user references
- Automatic rating calculations

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- Database connection string
- JWT secrets and expiration
- Email service credentials
- Stripe API keys
- File upload configurations

### Production Considerations
- Use HTTPS in production
- Set secure cookie options
- Configure proper CORS settings
- Set up monitoring and logging
- Use PM2 for process management
- Configure reverse proxy (Nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jonas Schmedtmann** - *Initial work* - [GitHub](https://github.com/jonasschmedtmann)

## 🙏 Acknowledgments

- Node.js and Express.js communities
- MongoDB documentation and best practices
- Stripe for payment processing
- All open-source contributors

---

**Keywords**: Node.js, Express.js, MongoDB, Adventure Tours, Booking System, JWT Authentication, Stripe Payments, Geospatial Queries, REST API, Full-Stack Development, Tour Management, User Authentication, Payment Processing, Image Upload, Email Notifications, Security, Rate Limiting, Data Validation
