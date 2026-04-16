# Abhivriddhi - Event Attendance System

A Next.js web application to manage event attendance using QR codes, with tools to register participants, send tickets, track attendance, and send certificates.

---

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Mongoose)
- **QR Scanner**: html5-qrcode
- **Email**: Nodemailer (Gmail)
- **Image Processing**: Sharp

---

## Setup

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd qr-attendance
   npm install
   ```

2. **Environment Variables**

   Create a `.env` file in the root:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/qr-attendance

   # Gmail (use App Password, not regular password)
   EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

   > To generate Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | QR code scanner to mark attendance |
| `/login` | Public | Admin login |
| `/guidelines` | Admin | How-to guide for using the system |
| `/convert-data` | Admin | Convert CSV/Excel to JSON |
| `/add-participant` | Admin | Bulk insert participants, delete collections |
| `/send-tickets` | Admin | Send event tickets with QR codes via email |
| `/attendance` | Admin | View, filter, and export attendance records |
| `/certificates` | Admin | Send personalized certificates via email |

**Admin credentials:**
```
Email:    abhivriddhi@gmail.com
Password: abhivriddhi@123
```

---

## Database Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Registered participants |
| `attendanceday1s` | Attendance for DAY1 ticket holders |
| `attendanceday2s` | Attendance for DAY2 ticket holders |
| `attendancecombos` | Attendance for COMBO ticket holders |
| `certificatesents` | Tracks who already received a certificate |

---

## QR Code Format

QR codes are generated with this exact format:

**VIT Students (with PRN):**
```
Name:VIKRANT THAKUR
PRN:12412111
Email:vikrant@vit.edu
TicketType:DAY1
```

**Non-VIT Students (without PRN):**
```
Name:JIDNYESH TOKE
Email:jidnyesh@gmail.com
TicketType:DAY2
```

---

## CSV Format (for Convert to JSON)

```csv
Name,PRN,Email,TicketType,RegisteredEvent
VIKRANT THAKUR,12412111,vikrant@vit.edu,COMBO,Event A
JIDNYESH TOKE,,jidnyesh@gmail.com,DAY1,Event A
```

| Column | Required | Notes |
|--------|----------|-------|
| Name | ✅ | Full name in uppercase |
| PRN | ❌ | Leave empty for non-VIT students |
| Email | ✅ | Used as primary identifier |
| TicketType | ✅ | `DAY1`, `DAY2`, or `COMBO` |
| RegisteredEvent | ✅ | `Event A`, `Event B`, or `Event C` |

---

## Workflow

```
1. Convert CSV → JSON       (Convert to JSON page)
2. Insert participants      (Add Participant page)
3. Send event tickets       (Send Tickets page)
4. Scan QR on event day     (Main page — public)
5. View attendance          (Total Attendance page)
6. Send certificates        (Send Certificates page)
```
