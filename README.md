# Car Rental Service - Full Stack Application

A modern, full-stack car rental management system built with Spring Boot and Angular.

## 📋 Project Overview

**Student**: J. Sihina Kaushalya  
**Registration**: 2021/ICTS/26  
**Project**: Car Rental Service

This application provides a complete solution for car rental management with features for both customers and administrators.

## 🚀 Features

### Customer Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Vehicle Browsing**: Browse and search available vehicles by type, brand, and price
- **Advanced Filtering**: Filter vehicles by multiple criteria
- **Online Booking**: Select dates, view pricing, and confirm reservations
- **Booking History**: View and manage personal booking history
- **Profile Management**: Update personal details and preferences

### Admin Features
- **Admin Dashboard**: Comprehensive overview of bookings and vehicles
- **Vehicle Management**: Full CRUD operations for vehicle fleet
- **Booking Management**: View all bookings and update statuses
- **User Management**: View and manage customer accounts

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Security**: Spring Security with JWT
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven

### Frontend
- **Framework**: Angular 17
- **Language**: TypeScript
- **Styling**: Custom CSS with modern design
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router

## 📦 Prerequisites

Before running this application, ensure you have:

- **Java JDK 17** or higher
- **Node.js 18** or higher
- **npm 9** or higher
- **MySQL 8.0** or higher
- **Maven 3.8** or higher
- **Angular CLI 17** or higher

## 🔧 Installation & Setup

### 1. Database Setup

```sql
CREATE DATABASE car_rental_db;
USE car_rental_db;

-- Tables will be auto-created by Hibernate
```

Update database credentials in `backend/application.properties`:
```properties
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run

# Backend will start on http://localhost:8080
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli

# Start development server
ng serve

# Frontend will start on http://localhost:4200
```

## 🗂️ Project Structure

### Backend Structure
```
backend/
├── src/main/java/com/carrental/
│   ├── CarRentalApplication.java       # Main application class
│   ├── config/
│   │   └── SecurityConfig.java         # Security configuration
│   ├── controller/
│   │   ├── AuthController.java         # Authentication endpoints
│   │   ├── VehicleController.java      # Vehicle CRUD endpoints
│   │   └── BookingController.java      # Booking endpoints
│   ├── model/
│   │   ├── User.java                   # User entity
│   │   ├── Vehicle.java                # Vehicle entity
│   │   └── Booking.java                # Booking entity
│   ├── repository/
│   │   ├── UserRepository.java         # User data access
│   │   ├── VehicleRepository.java      # Vehicle data access
│   │   └── BookingRepository.java      # Booking data access
│   ├── service/
│   │   ├── UserService.java            # User business logic
│   │   ├── VehicleService.java         # Vehicle business logic
│   │   └── BookingService.java         # Booking business logic
│   ├── security/
│   │   ├── JwtUtil.java                # JWT utility class
│   │   └── JwtAuthenticationFilter.java # JWT filter
│   └── dto/
│       ├── LoginRequest.java           # Login DTO
│       ├── LoginResponse.java          # Login response DTO
│       ├── RegisterRequest.java        # Registration DTO
│       └── BookingRequest.java         # Booking DTO
├── application.properties              # Application configuration
└── pom.xml                            # Maven dependencies
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/                  # Login component
│   │   │   ├── register/               # Registration component
│   │   │   ├── vehicle-browse/         # Vehicle browsing
│   │   │   ├── booking/                # Booking component
│   │   │   ├── my-bookings/            # User bookings
│   │   │   └── admin-dashboard/        # Admin dashboard
│   │   ├── services/
│   │   │   ├── auth.service.ts         # Authentication service
│   │   │   ├── vehicle.service.ts      # Vehicle service
│   │   │   └── booking.service.ts      # Booking service
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Authentication guard
│   │   │   └── admin.guard.ts          # Admin guard
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts      # JWT interceptor
│   │   ├── app.component.ts            # Root component
│   │   ├── app.component.html          # Root template
│   │   ├── app.component.css           # Root styles
│   │   └── app.module.ts               # App module
│   ├── styles.css                      # Global styles
│   ├── index.html                      # HTML entry point
│   └── main.ts                         # TypeScript entry point
├── angular.json                        # Angular configuration
├── package.json                        # npm dependencies
└── tsconfig.json                       # TypeScript configuration
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/{id}` - Get vehicle by ID
- `GET /api/vehicles/available` - Get available vehicles
- `GET /api/vehicles/search?type={type}&brand={brand}` - Search vehicles
- `POST /api/vehicles` - Create vehicle (Admin only)
- `PUT /api/vehicles/{id}` - Update vehicle (Admin only)
- `DELETE /api/vehicles/{id}` - Delete vehicle (Admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (Admin only)
- `GET /api/bookings/{id}` - Get booking by ID
- `GET /api/bookings/user/{userId}` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}/status` - Update booking status (Admin only)
- `DELETE /api/bookings/{id}` - Cancel booking

## 🎨 Design Features

The application features a **bold, modern aesthetic** with:

- **Gradient backgrounds** and dynamic color schemes
- **Smooth animations** and hover effects
- **Responsive grid layouts** for optimal viewing
- **Custom typography** using Outfit font family
- **Intuitive user interface** with clear visual hierarchy
- **Accessible design** with proper contrast ratios

## 🔑 Default Admin Account

For testing purposes, you can create an admin account by:

1. Register a normal user account
2. Update the user's role directly in the database:

```sql
UPDATE users SET roles = 'ADMIN' WHERE email = 'admin@example.com';
```

## 📱 Key Screens

1. **Login/Register**: Secure authentication with JWT
2. **Vehicle Browse**: Grid layout with filters and search
3. **Vehicle Details**: Comprehensive information and booking
4. **Booking Form**: Date selection and cost calculation
5. **My Bookings**: Personal booking history and management
6. **Admin Dashboard**: Fleet and booking management

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd frontend
ng test
```

## 🚢 Deployment

### Backend Deployment
1. Build the JAR file:
```bash
mvn clean package
```

2. Run the JAR:
```bash
java -jar target/car-rental-service-1.0.0.jar
```

### Frontend Deployment
1. Build for production:
```bash
ng build --prod
```

2. Deploy the `dist/` folder to your web server

## 📝 Environment Variables

### Backend (.env or application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/car_rental_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
jwt.secret=YOUR_SECRET_KEY
jwt.expiration=86400000
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🤝 Contributing

This is an academic project. For any suggestions or improvements, please contact the project owner.

## 📄 License

This project is created for educational purposes as part of the ICTS program.

## 👤 Author

**J. Sihina Kaushalya**  
Registration: 2021/ICTS/26  
Institution: [Your Institution Name]

## 🙏 Acknowledgments

- Spring Boot Documentation
- Angular Documentation
- Stack Overflow Community
- Course Instructors and Mentors

## 📞 Support

For issues or questions, please contact:
- Email: [your-email@example.com]
- GitHub: [your-github-profile]

---

**Note**: This README provides comprehensive documentation for the Car Rental Service application. Make sure to update configuration files with your actual credentials before deployment.
