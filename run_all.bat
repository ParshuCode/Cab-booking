@echo off
echo Starting Cab Booking System...

:: Create a logs directory if it doesn't exist
if not exist logs mkdir logs

echo Starting Service Registry (Eureka)...
start "Eureka Server" cmd /k "cd service && mvn spring-boot:run"
timeout /t 10

echo Starting Cab Service...
start "Cab Service" cmd /k "cd cab-service && mvn spring-boot:run"

echo Starting Booking Service...
start "Booking Service" cmd /k "cd booking-service && mvn spring-boot:run"

echo Starting Payment Service...
start "Payment Service" cmd /k "cd payment-service && mvn spring-boot:run"

echo Starting Notification Service (Kafka Consumer)...
start "Notification Service" cmd /k "cd notification-service && mvn spring-boot:run"

echo Starting User Service...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"

echo Starting Frontend...
start "Frontend" cmd /k "cd UserProject && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo IMPORTANT: Make sure Kafka is running on localhost:9092
echo If Kafka is not running, notification service will fail.
echo.
echo To start Kafka (if using Docker):
echo   docker run -d --name kafka -p 9092:9092 apache/kafka:latest
echo.
echo Check individual windows for service logs.
echo ========================================
pause
