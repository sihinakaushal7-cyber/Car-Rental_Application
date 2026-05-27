# Quick Setup Guide - Car Rental Service

## Prerequisites Checklist
- [ ] Java JDK 17 installed
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0 running
- [ ] Maven installed
- [ ] Angular CLI installed

## Step-by-Step Setup

### 1. Database Setup (5 minutes)

Open MySQL and run:
```sql
CREATE DATABASE car_rental_db;
```

Update `backend/application.properties`:
```properties
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend folder
cd backend

# Build and run
mvn spring-boot:run
```

✅ Backend should now be running on http://localhost:8080

### 3. Frontend Setup (5 minutes)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

✅ Frontend should now be running on http://localhost:4200

### 4. Test the Application

1. Open browser to http://localhost:4200
2. Click "Get Started" to register
3. Login with your credentials
4. Browse available vehicles
5. Make a test booking

### 5. Create Admin Account (Optional)

After registering a user, run in MySQL:
```sql
USE car_rental_db;
UPDATE users SET roles = 'ADMIN' WHERE email = 'your-email@example.com';
```

Now you can access the admin dashboard!

## Common Issues & Solutions

### Backend won't start
- Check if port 8080 is available
- Verify MySQL is running
- Check database credentials in application.properties

### Frontend won't start
- Check if port 4200 is available
- Delete node_modules and run `npm install` again
- Clear npm cache: `npm cache clean --force`

### CORS Errors
- Ensure backend CORS configuration includes http://localhost:4200
- Check if both backend and frontend are running

### Database Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify credentials in application.properties

## Development Workflow

1. **Start Backend First**: Always start the Spring Boot application first
2. **Then Start Frontend**: Start Angular development server
3. **Hot Reload**: Both support hot reload for development

## Project Structure at a Glance

```
car-rental-service/
├── backend/              # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── application.properties
├── frontend/             # Angular application
│   ├── src/
│   ├── angular.json
│   └── package.json
└── README.md
```

## Next Steps

✅ **You're all set!** The application should now be fully functional.

Try these features:
1. Register and login
2. Browse vehicles with filters
3. Create a booking
4. View your bookings
5. (Admin) Manage vehicles and bookings

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in README.md
- Verify all prerequisites are installed correctly

---

**Happy Coding! 🚗💨**
