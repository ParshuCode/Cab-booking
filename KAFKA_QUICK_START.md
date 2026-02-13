# Quick Start Guide - Kafka Integration

## Prerequisites Check

Before running the project, ensure you have:
- ✅ Java 17 installed
- ✅ Maven installed
- ✅ Node.js and npm installed
- ✅ MySQL running
- ✅ **Apache Kafka running** (NEW REQUIREMENT)

## Step 1: Start Kafka

### Option A: Using Docker (Recommended - Easiest)

```bash
# Pull and run Kafka in a single command
docker run -d --name kafka -p 9092:9092 apache/kafka:latest

# Verify Kafka is running
docker ps | findstr kafka
```

### Option B: Local Kafka Installation

1. Download Kafka from https://kafka.apache.org/downloads
2. Extract to a directory (e.g., `C:\kafka`)
3. Start Kafka:

```bash
# Navigate to Kafka directory
cd C:\kafka

# Start Kafka (includes built-in Zookeeper)
bin\windows\kafka-server-start.bat config\server.properties
```

### Verify Kafka is Running

```bash
# Check if port 9092 is listening
netstat -an | findstr 9092
```

You should see output like:
```
TCP    0.0.0.0:9092          0.0.0.0:0              LISTENING
```

## Step 2: Start All Services

Simply run the batch file:

```bash
run_all.bat
```

This will start all services in the correct order:
1. Eureka Server (Service Registry)
2. Cab Service
3. Booking Service
4. Payment Service
5. **Notification Service** (NEW - Kafka consumer)
6. User Service
7. Frontend (React app)

## Step 3: Verify Everything is Running

### Check Service Health

Open your browser and verify each service:

| Service | URL | Expected Response |
|---------|-----|-------------------|
| Eureka | http://localhost:8761 | Eureka dashboard |
| User Service | http://localhost:8081/actuator/health | `{"status":"UP"}` |
| Cab Service | http://localhost:8082/actuator/health | `{"status":"UP"}` |
| **Notification Service** | http://localhost:8083/actuator/health | `{"status":"UP"}` |
| Booking Service | http://localhost:8084/actuator/health | `{"status":"UP"}` |
| Payment Service | http://localhost:8085/actuator/health | `{"status":"UP"}` |
| Frontend | http://localhost:5173 | Application UI |

### Check Kafka Topics

```bash
# List all Kafka topics (should show booking-events, cab-events, etc.)
docker exec -it kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

## Step 4: Test the Kafka Integration

1. **Open the Frontend**: http://localhost:5173
2. **Create a Booking**:
   - Login as a user
   - Book a cab
3. **Check the Logs**:
   - **Booking Service window**: Should show "Publishing booking event to Kafka"
   - **Notification Service window**: Should show "Received booking event from Kafka"
   - **Cab Service window**: Should show "Received booking event from Kafka"

## Troubleshooting

### Issue: Notification Service fails to start

**Error**: `Connection to node -1 (localhost/127.0.0.1:9092) could not be established`

**Solution**: Kafka is not running. Start Kafka first (see Step 1).

### Issue: Port already in use

**Error**: `Port 8083 is already in use`

**Solution**: 
1. Find the process using the port:
   ```bash
   netstat -ano | findstr :8083
   ```
2. Kill the process:
   ```bash
   taskkill /PID <process_id> /F
   ```

### Issue: Services can't connect to Kafka

**Solution**: Check your `application.properties` files. The Kafka bootstrap server should be:
```properties
spring.kafka.bootstrap-servers=localhost:9092
```

### Issue: Frontend can't connect to backend

**Solution**: 
1. Verify all backend services are running
2. Check Eureka dashboard (http://localhost:8761) - all services should be registered
3. Check browser console for CORS errors

## What's Different with Kafka?

### Before (Without Kafka)
- Services communicated directly via REST APIs
- Synchronous, tightly coupled
- No event history

### After (With Kafka)
- Services communicate via events
- Asynchronous, loosely coupled
- Event history available for replay
- Real-time notifications via WebSocket

### Event Flow Example

When a user books a cab:

```
1. User clicks "Book Cab" in Frontend
   ↓
2. Frontend → Booking Service (REST API)
   ↓
3. Booking Service → Kafka (booking-created event)
   ↓
4. Kafka → Multiple Consumers:
   - Cab Service (assigns driver)
   - Notification Service (sends notification to user)
   ↓
5. Notification Service → Frontend (WebSocket)
   ↓
6. User sees real-time notification!
```

## Stopping Services

### Stop All Services
Simply close all the command windows that were opened by `run_all.bat`.

### Stop Kafka (Docker)
```bash
docker stop kafka
docker rm kafka
```

### Stop Kafka (Local Installation)
Press `Ctrl+C` in the Kafka terminal window.

## Next Steps

1. **Explore the Code**: Check out the Kafka producers and consumers in each service
2. **Monitor Kafka**: Use Kafka tools to see messages flowing through topics
3. **Customize Events**: Modify the event payloads to include more information
4. **Add More Topics**: Create new topics for different event types

## Quick Reference

### Kafka Commands (Docker)

```bash
# Start Kafka
docker run -d --name kafka -p 9092:9092 apache/kafka:latest

# Stop Kafka
docker stop kafka

# View Kafka logs
docker logs kafka

# List topics
docker exec -it kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# Describe a topic
docker exec -it kafka kafka-topics.sh --describe --topic booking-events --bootstrap-server localhost:9092

# Consume messages from a topic (for debugging)
docker exec -it kafka kafka-console-consumer.sh --topic booking-events --from-beginning --bootstrap-server localhost:9092
```

### Service Ports Quick Reference

```
8761 - Eureka Server
8081 - User Service
8082 - Cab Service
8083 - Notification Service (NEW)
8084 - Booking Service
8085 - Payment Service
5173 - Frontend
9092 - Kafka
```

## Need Help?

Check the detailed documentation:
- `KAFKA_MERGE_SUMMARY.md` - Complete merge details
- `README.md` - Project overview
- Service-specific README files in each service directory

---

**Happy Coding!** 🚀
