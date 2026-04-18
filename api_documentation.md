# Fixivo Service Platform API Documentation

This document provides the API endpoints, methods, and example raw JSON data required for Postman.

**Base URL:** `http://localhost:5000` (Update as per your server configuration)

---

## 🔐 Authentication

Most routes expect a Bearer Token in the headers:
`Authorization: Bearer <accessToken>`

### 1. Customer Registration
- **URL:** `/auth/customer/register`
- **Method:** `POST`
- **Body (Raw JSON):**
```json
{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
}
```

### 2. Customer Login
- **URL:** `/auth/customer/login`
- **Method:** `POST`
- **Body (Raw JSON):**
```json
{
    "email": "jane@example.com",
    "password": "password123"
}
```

### 3. Provider Registration
- **URL:** `/auth/provider/register`
- **Method:** `POST`
- **Body (Raw JSON):**
```json
{
    "name": "John Service",
    "email": "john@service.com",
    "password": "password123",
    "phone": "1234567890",
    "serviceType": "Plumber"
}
```

### 4. Provider Login
- **URL:** `/auth/provider/login`
- **Method:** `POST`
- **Body (Raw JSON):**
```json
{
    "email": "john@service.com",
    "password": "password123"
}
```

### 5. Refresh Token
- **URL:** `/auth/refresh-token`
- **Method:** `POST`
- **Body (Raw JSON):**
```json
{
    "refreshToken": "<your_refresh_token_here>"
}
```

### 6. Logout
- **URL:** `/auth/logout`
- **Method:** `POST`
- **Auth:** Required (Bearer Token)

---

## 👥 Customer APIs

### 1. Get Verified Providers
- **URL:** `/api/customer/verified-providers`
- **Method:** `GET`

---

## 🛠️ Provider APIs

### 1. Complete Profile
- **URL:** `/api/provider/complete-profile`
- **Method:** `PUT`
- **Auth:** Required (Bearer Token)
- **Body (Raw JSON):**
```json
{
    "experience": "5 years",
    "availability": "Mon-Fri, 9AM-5PM",
    "latitude": 12.9716,
    "longitude": 77.5946
}
```

### 2. Complete Work (Generate OTP)
- **URL:** `/api/provider/complete-work/:requestId`
- **Method:** `PUT`
- **Auth:** Required (Bearer Token)

### 3. Verify OTP and Complete
- **URL:** `/api/provider/verify-otp/:requestId`
- **Method:** `POST`
- **Auth:** Required (Bearer Token)
- **Body (Raw JSON):**
```json
{
    "otp": "123456"
}
```

### 4. Get Completed Requests
- **URL:** `/api/provider/completed-requests?page=1&limit=10`
- **Method:** `GET`
- **Auth:** Required (Bearer Token)

---

## 📝 Service Request APIs

### 1. Send Request to Provider
- **URL:** `/api/request/send-request`
- **Method:** `POST`
- **Auth:** Required (Bearer Token)
- **Body (Raw JSON):**
```json
{
    "providerId": "<provider_doc_id>",
    "requestDetails": {
        "serviceType": "Plumber",
        "details": "Kitchen pipe leakage fix",
        "scheduledTime": "2026-04-20T10:00:00Z"
    }
}
```

### 2. Get My Requests (Customer)
- **URL:** `/api/request/customer-requests`
- **Method:** `GET`
- **Auth:** Required (Bearer Token)

### 3. Get Request Status (Customer)
- **URL:** `/api/request/customer-requests-status`
- **Method:** `GET`
- **Auth:** Required (Bearer Token)

### 4. Accept Request (Provider)
- **URL:** `/api/request/accept-request/:id`
- **Method:** `POST`
- **Auth:** Required (Bearer Token)

### 5. Reject Request (Provider)
- **URL:** `/api/request/reject-request/:id`
- **Method:** `POST`
- **Auth:** Required (Bearer Token)

### 6. Provider Dashboard Requests
- **URL:** `/api/request/see-requests-inside-provider-dashboard`
- **Method:** `GET`
- **Auth:** Required (Bearer Token)

### 7. Emergency Service Request
- **URL:** `/api/request/emergency-service`
- **Method:** `POST`
- **Auth:** Required (Bearer Token)
- **Body (Raw JSON):**
```json
{
    "location": {
        "coordinates": [77.5946, 12.9716]
    },
    "description": "Pipe burst, immediate help needed!",
    "serviceType": "Plumber"
}
```

### 8. Recommendation Service (Find Nearby)
- **URL:** `/api/request/recommendation-service`
- **Method:** `POST`
- **Auth:** Required (Bearer Token)
- **Body (Raw JSON):**
```json
{
    "location": {
        "coordinates": [77.5946, 12.9716]
    },
    "serviceType": "Plumber",
    "page": 1,
    "limit": 10
}
```
