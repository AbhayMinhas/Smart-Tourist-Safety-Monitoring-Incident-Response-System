# Capstone-Backend
# Smart Tourist Safety Monitoring & Incident Response System (Backend)

## Overview

This backend powers a real-time tourist safety platform with:

* Secure authentication (JWT-based)
* User profile & safety profile management
* Emergency SOS system with email alerts
* Real-time location tracking (Socket.IO)
* Nearby users via geospatial queries

The system is designed with a **clean modular architecture**, scalability, and real-world backend practices.

---

## Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* Socket.IO (real-time communication)
* JWT Authentication
* Joi Validation
* Nodemailer (Email service)
* EJS + Leaflet (Map testing interface)

---

## Project Structure

```
src/
├── config/
├── middleware/
├── validators/
├── utils/
├── routes/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── emergency/
│   ├── location/
├── app.js
```

---

## Environment Variables

Create a `.env` file:

```
PORT=7000
DB_CONNECTION_STRING=your_mongodb_uri
JWT_SECRET=your_secret_key

EMAIL_PROVIDER=gmail
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```
you can also setup the provider to AMAZON SES just by setting up the .env in different manner as the code is provider agnostic
for AWS SES:
```
EMAIL_PROVIDER=ses  
SES_HOST=email-smtp.ap-south-1.amazonaws.com  
SES_PORT=587  
SES_USER=xxxx  
SES_PASS=xxxx
```
---

## Installation & Setup

```
npm install
npm run dev
```

Server runs at:

```
http://localhost:7000
```

---

## Authentication

All protected routes require JWT. which is set in request header.

### Header Format

```
Authorization: Bearer <token>
```

* Header name: `authorization`
* Value format: `Bearer <token>`

---

# API CONTRACT

## Common Response Format

### Success

```
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Error

```
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

---

# AVAILABLE API ENDPOINTS

---

## AUTH MODULE

### Register

```
POST /api/auth/register
```

Request:

```
{
  "firstName": "Abhay",
  "lastName": "Minhas",
  "email": "abhay@example.com",
  "password": "Password123",
  "age": 22,
  "gender": "male"
}
```

Response:

```
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {},
    "token": "jwt_token"
  }
}
```

---

### Login

```
POST /api/auth/login
```

Request:

```
{
  "email": "abhay@example.com",
  "password": "Password123"
}
```

Response:

```
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "token": "jwt_token"
  }
}
```

---

## USER MODULE

### Get Profile

```
GET /api/user/profile
```

Headers:

```
Authorization: Bearer <token>
```

Response:

```
{
  "success": true,
  "data": {
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "safetyProfile": {}
  }
}
```

---

### Update Profile (Includes Safety Profile)

```
PATCH /api/user/profile
```

Headers:

```
Authorization: Bearer <token>
```

Request (partial update allowed):

```
{
  "firstName": "Abhay",
  "photoUrl": "https://...",
  "safetyProfile": {
    "bloodGroup": "B+",
    "allergies": "None",
    "medicalNotes": "N/A",
    "emergencyContacts": [
      {
        "name": "John",
        "phone": "+1234567890",
        "email": "john@example.com"
      }
    ]
  }
}
```

Response:

```
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {}
}
```

---

## EMERGENCY MODULE

### Trigger SOS

```
POST /api/emergency/sos
```

Headers:

```
Authorization: Bearer <token>
```

Request:

```
{
  "message": "Need help urgently"
}
```

Response:

```
{
  "success": true,
  "message": "SOS triggered successfully",
  "data": {}
}
```

---

### Get Emergency History

```
GET /api/emergency/history
```

Headers:

```
Authorization: Bearer <token>
```

---

### Get Single Emergency

```
GET /api/emergency/:id
```

Headers:

```
Authorization: Bearer <token>
```

---

### Resolve Emergency

```
PATCH /api/emergency/:id/resolve
```

Headers:

```
Authorization: Bearer <token>
```

---

## LOCATION MODULE

### Nearby Users (Used Internally by Map)

```
GET /api/locations/nearby?lat=<lat>&lng=<lng>
```

* Requires JWT
* Used by map interface (`/api/map`)
* Returns nearby users within radius

Response:

```
{
  "success": true,
  "data": [
    {
      "userId": "123",
      "name": "User",
      "coordinates": [lng, lat]
    }
  ]
}
```

---

## MAP ENDPOINT

```
GET /api/map
```

* Protected route
* Returns map UI (EJS)
* Injects JWT token into frontend
* Automatically establishes socket connection

---

# REAL-TIME LOCATION SYSTEM

## Important for Frontend Developers

* Frontend **DOES NOT need to manually implement socket connection**
* Socket is already handled inside the map (`map.ejs`)
* Token is injected automatically

---

## Socket Behavior

* Authenticated using JWT
* Client sends location via:

```
send-location
```

Payload:

```
{
  "latitude": number,
  "longitude": number
}
```

---

## Backend Handling

* Stores latest location in memory (Map)
* Saves location in DB using:

  * time-based throttling
  * distance-based filtering
* Saves last location on disconnect

---

# LOCATION SYSTEM DESIGN

* GeoJSON format: `[longitude, latitude]`
* MongoDB `2dsphere` index
* Hybrid system:

```
Socket → write (location updates)
API → read (nearby users via geo query)
```

---
# Map Feature

* the map gives all the users in 100m range to the user, here we use API polling for this purpose.
* the name of all the users will appear on the users posiion icon
* to distinguish between the user itself and other users the colour of the current user map marker will be blue and others will be yellow.

# SAFETY PROFILE

Stored inside user model:

* Blood Group
* Allergies
* Medical Notes
* Emergency Contacts

Updated using:

```
PATCH /api/user/profile
```

---

# SOS FLOW

1. User triggers SOS
2. System retrieves location:

   * First from memory (latest)
   * Fallback to database
3. Sends email alerts to emergency contacts
4. Stores emergency record

---

# FRONTEND INTEGRATION NOTES

* Always include JWT in Authorization header
* Do not send location too frequently
* Use `/api/map` for web-based map testing
* Use `/api/locations/nearby` for fetching nearby users
* Poll API every 5–10 seconds for updates

---

# CURRENT STATUS

Completed:

* Authentication system
* User profile + safety profile
* Emergency SOS system
* Real-time location tracking
* Nearby users (geospatial query)

Incident module: in progress

---

# SUMMARY

This backend provides:

* Secure API architecture
* Real-time location capabilities
* Scalable geospatial querying
* Clean modular design

It is ready for integration with:

* Android frontend (Kotlin)
* Web frontend (React / WebView)

Designed with real-world backend practices and scalability in mind.
