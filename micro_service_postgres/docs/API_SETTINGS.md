# App Settings API Documentation

## Overview
The Settings API allows you to manage application-wide settings including booking rules and night surge charges.

---

## Endpoints

### 1. Get Application Settings

Retrieve current application settings. If no settings exist in the database, returns default values.

**Endpoint:** `GET /api/settings`

**Authentication:** Not required

**Request:**
```http
GET /api/settings HTTP/1.1
Host: your-domain.com
```

**Response (200 OK):**
```json
{
  "response": 200,
  "status": true,
  "message": "Settings retrieved successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7890abc16",
    "minimum_booking_hours_ahead": 2,
    "night_surge_enabled": true,
    "night_surge_start_time": "22:00",
    "night_surge_end_time": "06:00",
    "surge_charge_fee": 100,
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-02-01T14:20:00.000Z"
  }
}
```

**Response (200 OK - Default Settings):**
```json
{
  "response": 200,
  "status": true,
  "message": "Default settings (not saved in DB yet)",
  "data": {
    "minimum_booking_hours_ahead": 2,
    "night_surge_enabled": true,
    "night_surge_start_time": "22:00",
    "night_surge_end_time": "06:00",
    "surge_charge_fee": 100
  }
}
```

---

### 2. Update Application Settings

Update application settings. Admin only operation (authentication required in production).

**Endpoint:** `PATCH /api/settings`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "minimum_booking_hours_ahead": 3,
  "night_surge_enabled": true,
  "night_surge_start_time": "23:00",
  "night_surge_end_time": "05:00",
  "surge_charge_fee": 150
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `minimum_booking_hours_ahead` | number | No | Minimum hours before a booking can be made (default: 2) |
| `night_surge_enabled` | boolean | No | Enable/disable night surge charges (default: true) |
| `night_surge_start_time` | string | No | Night surge start time in HH:MM format (default: "22:00") |
| `night_surge_end_time` | string | No | Night surge end time in HH:MM format (default: "06:00") |
| `surge_charge_fee` | number | No | Fixed night surge charge in rupees (default: 100) |

**Request Example:**
```http
PATCH /api/settings HTTP/1.1
Host: your-domain.com
Content-Type: application/json
Authorization: Bearer your-admin-token

{
  "minimum_booking_hours_ahead": 3,
  "night_surge_enabled": true,
  "night_surge_start_time": "23:00",
  "night_surge_end_time": "05:00",
  "surge_charge_fee": 150
}
```

**Response (200 OK):**
```json
{
  "response": 200,
  "status": true,
  "message": "Settings updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7890abc16",
    "minimum_booking_hours_ahead": 3,
    "night_surge_enabled": true,
    "night_surge_start_time": "23:00",
    "night_surge_end_time": "05:00",
    "surge_charge_fee": 150,
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-02-03T09:15:00.000Z"
  }
}
```

**Partial Update Example:**

You can update only specific fields without affecting others:

```json
{
  "surge_charge_fee": 200
}
```

**Response:**
```json
{
  "response": 200,
  "status": true,
  "message": "Settings updated successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7890abc16",
    "minimum_booking_hours_ahead": 2,
    "night_surge_enabled": true,
    "night_surge_start_time": "22:00",
    "night_surge_end_time": "06:00",
    "surge_charge_fee": 200,
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-02-03T09:20:00.000Z"
  }
}
```

---

### 3. Initialize Default Settings

Create default settings in the database if none exist. Should be run once during initial setup.

**Endpoint:** `POST /api/settings/initialize`

**Authentication:** Not required (should be secured in production)

**Request:**
```http
POST /api/settings/initialize HTTP/1.1
Host: your-domain.com
```

**Response (200 OK - Created):**
```json
{
  "response": 200,
  "status": true,
  "message": "Default settings created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7890abc16",
    "minimum_booking_hours_ahead": 2,
    "night_surge_enabled": true,
    "night_surge_start_time": "22:00",
    "night_surge_end_time": "06:00",
    "surge_charge_fee": 100,
    "created_at": "2026-02-03T09:30:00.000Z",
    "updated_at": "2026-02-03T09:30:00.000Z"
  }
}
```

**Response (200 OK - Already Exists):**
```json
{
  "response": 200,
  "status": true,
  "message": "Settings already initialized",
  "data": {
    "_id": "64f1a2b3c4d5e6f7890abc16",
    "minimum_booking_hours_ahead": 2,
    "night_surge_enabled": true,
    "night_surge_start_time": "22:00",
    "night_surge_end_time": "06:00",
    "surge_charge_fee": 100,
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-02-01T14:20:00.000Z"
  }
}
```

---

## Settings Usage Examples

### How Settings Are Applied

#### 1. Minimum Booking Hours Ahead
```javascript
// Example: minimum_booking_hours_ahead = 2
// Current time: 2026-02-03 10:00 AM
// Earliest allowed booking time: 2026-02-03 12:00 PM
```

Bookings cannot be made for trips starting less than this many hours from now.

#### 2. Night Surge Charges
```javascript
// Example settings:
{
  "night_surge_enabled": true,
  "night_surge_start_time": "22:00",
  "night_surge_end_time": "06:00",
  "surge_charge_fee": 100
}

// If trip starts between 10:00 PM and 6:00 AM:
// Base fare: ₹500
// Night surge fee: ₹100 (fixed)
// Total: ₹600
```

The surge charge is a **fixed fee** added to the base fare, not a multiplier.

---

## Error Responses

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to get settings: Database connection error",
  "error": "Internal Server Error"
}
```

```json
{
  "statusCode": 500,
  "message": "Failed to update settings: Validation error",
  "error": "Internal Server Error"
}
```

---

## Notes

1. **Single Settings Document**: The system maintains only one settings document in the database
2. **Default Values**: If no settings exist in DB, default values are returned by GET endpoint
3. **Partial Updates**: PATCH endpoint supports updating individual fields without affecting others
4. **Time Format**: Use 24-hour format (HH:MM) for surge time settings
5. **Surge Fee**: The `surge_charge_fee` is a fixed amount in rupees, not a percentage or multiplier
6. **Booking Window**: The `minimum_booking_hours_ahead` prevents last-minute bookings for driver assignment
7. **Admin Only**: Update operations should be restricted to admin users in production environment

---

## Testing with cURL

### Get Settings
```bash
curl -X GET http://localhost:3000/api/settings
```

### Update Settings
```bash
curl -X PATCH http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{
    "minimum_booking_hours_ahead": 3,
    "surge_charge_fee": 150
  }'
```

### Initialize Settings
```bash
curl -X POST http://localhost:3000/api/settings/initialize
```

---

## Integration Tips

### Frontend Integration

```javascript
// Fetch settings on app start
async function loadAppSettings() {
  const response = await fetch('/api/settings');
  const { data } = await response.json();
  
  // Store in global state
  return data;
}

// Check if booking time is valid
function canBookTrip(tripDateTime, settings) {
  const minHours = settings.minimum_booking_hours_ahead;
  const minTime = new Date(Date.now() + minHours * 60 * 60 * 1000);
  return new Date(tripDateTime) >= minTime;
}

// Calculate total fare with surge
function calculateFare(baseFare, tripDateTime, settings) {
  let total = baseFare;
  
  if (settings.night_surge_enabled) {
    const tripTime = new Date(tripDateTime);
    const hour = tripTime.getHours();
    const minute = tripTime.getMinutes();
    
    const [startH, startM] = settings.night_surge_start_time.split(':').map(Number);
    const [endH, endM] = settings.night_surge_end_time.split(':').map(Number);
    
    // Check if trip falls in surge period
    if (isInSurgePeriod(hour, minute, startH, startM, endH, endM)) {
      total += settings.surge_charge_fee;
    }
  }
  
  return total;
}
```

---

**Last Updated:** February 3, 2026
