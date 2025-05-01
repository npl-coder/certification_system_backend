# Certification System API

An Express.js backend API for generating, managing, and verifying certificates, with email distribution capabilities.

## Features

- Certificate generation with customizable templates
- Bulk certificate generation from CSV data
- Certificate verification system
- Email distribution of certificates
- Event and category management
- Authentication and authorization
- RESTful API design

## Technology Stack

- **Backend Framework**: Express.js
- **Database**: MySQL/PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer
- **Image Processing**: Sharp
- **File Upload**: Multer

## Prerequisites

- Node.js (v14 or higher)
- MySQL or PostgreSQL
- SMTP server access for sending emails

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/certification-system.git
cd certification-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the example provided in the repository:
```
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=certification_system
DB_DIALECT=mysql

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# File Storage
STORAGE_TYPE=local
```

4. Set up your database:
```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE certification_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

5. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Routes

### Authentication Routes
- `POST /api/auth/register` - Register a new admin user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user details

### Certificate Routes
- `GET /api/certificates` - Get all certificates (admin only)
- `POST /api/certificates` - Generate certificates from CSV (admin only)
- `POST /api/certificates/templates` - Upload certificate template (admin only)
- `GET /api/certificates/verify/:certificateId` - Verify certificate (public)
- `PUT /api/certificates/:certificateId` - Regenerate certificate (admin only)

### Event Routes
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event (admin only)
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Category Routes
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category (admin only)
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Email Routes
- `POST /api/emails/send/:certificateId` - Send certificate via email (admin only)
- `POST /api/emails/bulk` - Send bulk certificates via email (admin only)
- `GET /api/emails/status` - Get email status for certificates (admin only)

## Usage Examples

### Generating Certificates

1. First, upload a certificate template:
```
POST /api/certificates/templates
Content-Type: multipart/form-data
Authorization: Bearer <your_token>

Form-data:
- template: [certificate template image file]
```

2. Then, create an event:
```
POST /api/events
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "name": "Web Development Workshop",
  "description": "A workshop on web development with Express.js",
  "eventDate": "2025-05-01",
  "location": "Online"
}
```

3. Generate certificates from a CSV file:
```
POST /api/certificates
Content-Type: multipart/form-data
Authorization: Bearer <your_token>

Form-data:
- csv: [CSV file with recipient details]
- eventId: [event-id]
- templateId: [template-filename]
```

### Verifying a Certificate

```
GET /api/certificates/verify/:certificateId
```

### Sending Certificates via Email

```
POST /api/emails/bulk
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "eventId": "event-id"
}
```

## License

MIT
Feel free to use and modify this code for your own projects. Contributions are welcomed!