# Project Report: DriveNow Car Rental Service

## 1. Project Overview
- **Project Title:** Car Rental Service (DriveNow)
- **Prepared by:** J. Sihina Kaushalya
- **Registration Number:** 2021/ICTS/26
- **Department / Faculty:** Information and Communication Technology
- **University Name:** [Your University Name]
- **Submission Date:** December 2024

## 2. Objectives & Scope

### Objectives
- To develop a comprehensive full-stack car rental management system.
- To implement secure user authentication and role-based access control (Admin vs. Customer).
- To provide an intuitive interface for users to browse, search, and book vehicles.
- To streamline vehicle and booking management for administrators.
- To ensure data integrity and efficient handling of concurrent bookings.

### Scope
- **Functional:**
    - **User Module:** Registration, Login, Profile Management, Vehicle Browsing, Booking Creation, Booking History.
    - **Admin Module:** Dashboard Analytics, Vehicle CRUD (Create, Read, Update, Delete), Booking Status Management, User Management.
- **Non-Functional:**
    - **Security:** JWT-based authentication, Password encryption (BCrypt).
    - **Performance:** Optimized database queries, Responsive frontend design.
    - **Reliability:** Data validation at both frontend and backend levels.

## 3. Technology Stack

### Frontend
- **Framework:** Angular 17
- **Language:** TypeScript
- **Styling:** Custom CSS, Responsive Grid Layout
- **HTTP Client:** Angular HttpClient

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Architecture:** BS (Browser-Server) / RESTful API
- **Security:** Spring Security, JWT (JSON Web Tokens)
- **Data Access:** Spring Data JPA, Hibernate

### Database
- **RDBMS:** MySQL 8.0

### Tools & Deployment
- **Build Tools:** Maven (Backend), npm/Angular CLI (Frontend)
- **Version Control:** Git
- **IDE:** IntelliJ IDEA / VS Code

## 4. Features & Functionalities

| Feature | Description |
| :--- | :--- |
| **User Registration & Login** | Secure sign-up and login utilizing JWT for session management. |
| **Vehicle Browsing & Filtering** | Users can browse fleet with filters for Brand, Type, and Price. |
| **Booking System** | Real-time availability checks, date selection, and cost calculation. |
| **Admin Dashboard** | Overview of total bookings, active users, and fleet status and recent activities. |
| **Vehicle Management (Admin)** | Admins can add new cars, update details, and change availability status. |
| **Booking Management (Admin)** | Admins can view all bookings and update statuses (Approved, Completed, Cancelled). |
| **User Profile** | Customers can view their booking history and update personal details. |

## 5. UI/UX Screenshots

*(Please insert your actual screenshots in the placeholders below)*

### **5.1 Login Page**
*Captures user credentials securely.*
![Login Page Screenshot](placeholder_login.png)

### **5.2 Vehicle Browse Page**
*Grid view of available vehicles with search and filter options.*
![Vehicle Browse Screenshot](placeholder_browse.png)

### **5.3 Admin Dashboard**
*Key metrics and quick access to management functions.*
![Admin Dashboard Screenshot](placeholder_dashboard.png)

### **5.4 Booking Confirmation**
*Summary of the booking details before final confirmation.*
![Booking Confirmation Screenshot](placeholder_booking.png)

## 6. Challenges & Resolutions

| Challenge | Resolution |
| :--- | :--- |
| **CORS Errors** | Issues connecting Angular to Spring Boot due to Cross-Origin Resource Sharing were resolved by configuring global CORS settings in Spring Security. |
| **JWT State Management** | Maintaining user session state across page reloads was solved by storing the JWT in `localStorage` and using an Angular Interceptor to attach it to requests. |
| **Booking Date Conflicts** | Preventing overlapping bookings for the same vehicle required implementing a validation logic in the `BookingService` that checks existing bookings against the requested date range. |
| **Responsive Design** | Ensuring the grid layout breaks down correctly on mobile devices was achieved using CSS Media Queries and flexible flexbox/grid containers. |

## 7. Conclusion
The "DriveNow" Car Rental Service project successfully demonstrates the implementation of a modern, full-stack web application. Key achievements include a robust RESTful API backend, a responsive and interactive Angular frontend, and a secure authentication system. The project fulfills the core objectives of enabling seamless car rental operations for both customers and administrators. Lessons learned include the importance of clear API documentation, state management in SPAs, and robust error handling.

## 8. Future Enhancements
- **Payment Gateway Integration:** Allow users to pay for bookings online via Stripe or PayPal.
- **Email/SMS Notifications:** Automated confirmation messages and reminders for bookings.
- **Advanced Reporting:** Generate PDF/Excel reports for earnings and vehicle utilization.
- **Review System:** Allow customers to rate and review vehicles after their trip.
- **Mobile Application:** Develop a React Native or Flutter app for mobile access.
