# 🚗 Car Rental Backend - Complete Setup Guide

## 📋 Prerequisites

✅ Java 17 or higher installed
✅ Maven 3.6+ installed
✅ PostgreSQL installed and running
✅ pgAdmin or database tool
✅ IDE (IntelliJ IDEA, Eclipse, or VS Code)

---

## 🚀 Quick Start

### Step 1: Start PostgreSQL Service

```powershell
# Check if running
Get-Service -Name *postgres*

# Start if not running
Start-Service postgresql-x64-18
```

### Step 2: Create Database

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to PostgreSQL
3. Right-click "Databases" → Create → Database
4. Name: `car_rental`
5. Save

**Using psql:**
```sql
psql -U postgres
CREATE DATABASE car_rental;
\q
```

### Step 3: Configure Application

**Edit:** `src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/car_rental
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD_HERE
```

**⚠️ IMPORTANT:** Replace `YOUR_PASSWORD_HERE` with your actual PostgreSQL password!

### Step 4: Build the Project

```powershell
cd backend
mvn clean install
```

### Step 5: Run the Application

```powershell
mvn spring-boot:run
```

✅ API will be running at: `http://localhost:8080/api`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/carrental/
│   │   │       ├── CarRentalApplication.java
│   │   │       ├── model/
│   │   │       │   ├── Car.java
│   │   │       │   ├── User.java
│   │   │       │   └── Booking.java
│   │   │       ├── repository/
│   │   │       │   ├── CarRepository.java
│   │   │       │   ├── UserRepository.java
│   │   │       │   └── BookingRepository.java
│   │   │       ├── controller/
│   │   │       │   └── CarController.java
│   │   │       └── config/
│   │   │           └── CorsConfig.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

---

## 🔧 Fixing Common Errors

### Error 1: "Cannot connect to database"

**Problem:** PostgreSQL is not running

**Solution:**
```powershell
Start-Service postgresql-x64-18
```

### Error 2: "Password authentication failed"

**Problem:** Wrong password in application.properties

**Solution:**
1. Open `application.properties`
2. Update `spring.datasource.password=YOUR_ACTUAL_PASSWORD`
3. Restart application

### Error 3: "Port 8080 already in use"

**Problem:** Another application using port 8080

**Solution:**
Change port in `application.properties`:
```properties
server.port=8081
```

### Error 4: "Maven build fails - Cannot download dependencies"

**Problem:** Network/Maven repository issue

**Solution A - Use Maven Mirror:**
Create file: `C:\Users\YourUsername\.m2\settings.xml`
```xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <name>Aliyun Maven</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```

**Solution B - Clear Maven Cache:**
```powershell
Remove-Item -Recurse -Force $env:USERPROFILE\.m2\repository
mvn clean install -U
```

### Error 5: "Table doesn't exist"

**Problem:** Database tables not created

**Solution:**
Hibernate will auto-create tables because of:
```properties
spring.jpa.hibernate.ddl-auto=update
```

Just restart the application!

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Get All Cars
```bash
curl http://localhost:8080/api/cars
```

### Get Cars by Category
```bash
curl http://localhost:8080/api/cars/category/SUV
```

### Create a Car
```bash
curl -X POST http://localhost:8080/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "color": "Silver",
    "licensePlate": "ABC123",
    "category": "Sedan",
    "transmission": "Automatic",
    "fuelType": "Gasoline",
    "seats": 5,
    "dailyRate": 45.00,
    "status": "available",
    "location": "Downtown"
  }'
```

---

## 📊 Database Schema

Tables will be auto-created:

- **users** - Customer and admin accounts
- **cars** - Vehicle inventory
- **bookings** - Rental bookings

---

## 🛠️ Development Tools

### Recommended IDE Setup

**IntelliJ IDEA:**
1. File → Open → Select `backend` folder
2. Maven will auto-import
3. Run `CarRentalApplication.java`

**VS Code:**
1. Install "Extension Pack for Java"
2. Install "Spring Boot Extension Pack"
3. Open `backend` folder
4. Run from Spring Boot Dashboard

### Hot Reload

Spring Boot DevTools is included for auto-reload:
- Just save your Java files
- Application will auto-restart

---

## 🔒 Security Notes

**For Development:**
- Security is currently disabled
- CORS allows all origins
- No authentication required

**For Production:**
- Enable Spring Security
- Implement JWT authentication
- Restrict CORS origins
- Use environment variables for secrets

---

## 📝 Environment Variables

Instead of hardcoding in application.properties, use:

```powershell
# Windows
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="your_secret"

# Then in application.properties:
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```

---

## 🐳 Docker (Optional)

**Create Dockerfile:**
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/car-rental-service-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

**Run:**
```bash
mvn clean package
docker build -t car-rental-backend .
docker run -p 8080:8080 car-rental-backend
```

---

## 📚 API Endpoints

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/{id}` - Get car by ID
- `GET /api/cars/available` - Get available cars
- `GET /api/cars/category/{category}` - Get cars by category
- `POST /api/cars` - Create car
- `PUT /api/cars/{id}` - Update car
- `DELETE /api/cars/{id}` - Delete car

**Query Parameters for GET /api/cars:**
- `category` - Filter by category
- `transmission` - Filter by transmission
- `status` - Filter by status
- `location` - Filter by location

Example:
```
GET /api/cars?category=SUV&transmission=Automatic&status=available
```

---

## 🎯 Next Steps

1. ✅ Backend running
2. ✅ Database created
3. ⬜ Add authentication (JWT)
4. ⬜ Create frontend
5. ⬜ Deploy to production

---

## 📞 Troubleshooting Checklist

- [ ] PostgreSQL service is running
- [ ] Database `car_rental` exists
- [ ] Password in application.properties is correct
- [ ] Port 8080 is available
- [ ] Java 17 is installed
- [ ] Maven can access internet
- [ ] No firewall blocking

---

## 🚀 Quick Commands

```powershell
# Start PostgreSQL
Start-Service postgresql-x64-18

# Build project
mvn clean install

# Run application
mvn spring-boot:run

# Run tests
mvn test

# Package as JAR
mvn clean package

# Run JAR
java -jar target/car-rental-service-1.0.0.jar
```

---

## 📖 Additional Resources

- Spring Boot Docs: https://spring.io/projects/spring-boot
- Spring Data JPA: https://spring.io/projects/spring-data-jpa
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Need help? Check the error messages carefully and refer to this guide!** 🎉
