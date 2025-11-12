# QR Code Attendance System

A Next.js-based attendance management system that allows event registration and QR code-based attendance marking.

## Features

- **Event Registration**: Add users with unique IDs for specific events
- **QR Code Scanning**: Real-time QR code scanning for attendance marking
- **Event Management**: Support for multiple events (Event A, B, C)
- **Duplicate Prevention**: Prevents marking attendance twice for the same user/event
- **Partial QR Matching**: Handles truncated QR codes automatically
- **MongoDB Integration**: Stores user and attendance data in MongoDB Atlas

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **QR Scanner**: html5-qrcode library
- **UI Components**: Custom components with Radix UI

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qr-attendance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Add User
```http
POST /api/add-user
Content-Type: application/json

{
  "id": "Name:John Doe\nPRN:12345\nTicketID:ABC123 Event A",
  "name": "John Doe",
  "prn": "12345",
  "registeredEvent": "Event A"
}
```

### Mark Attendance
```http
POST /api/mark-attendance
Content-Type: application/json

{
  "userId": "Name:John Doe\nPRN:12345\nTicketID:ABC123",
  "eventName": "Event A"
}
```

## Usage

1. **Register Users**: Use the `/api/add-user` endpoint to register users for events
2. **Select Event**: Choose the event from the dropdown on the main page
3. **Start Scanner**: Click "Start Scanner" to activate QR code scanning
4. **Scan QR Code**: Point camera at QR code to mark attendance
5. **View Results**: Success/error messages appear instantly

## Database Schema

### User Collection
```javascript
{
  id: String (unique),
  name: String,
  prn: String,
  registeredEvent: [String]
}
```

### Attendance Collection
```javascript
{
  userId: String,
  registeredEvent: String,
  timestamp: Date
}
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add `MONGODB_URI` environment variable
4. Deploy

### Other Platforms
Ensure Node.js 18+ support and set the `MONGODB_URI` environment variable.

## License

MIT License