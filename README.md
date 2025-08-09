# Certification System Backend

Express.js API for generating, managing, verifying, and emailing certificates. Supports bulk generation from CSV with optional JSON mapping for precise text positioning on certificate templates.

## Highlights

- Bulk certificate generation from CSV (+ optional mapping.json)
- Template upload and image compositing via Sharp
- Verification and secure download endpoints
- Events, categories, and users via Sequelize ORM
- JWT auth, CORS, Helmet, structured error handling

## Tech

- Express 4, Sequelize (MySQL/MariaDB/Postgres), Sharp, Multer, Nodemailer

## Requirements

- Node.js 18+
- MySQL/MariaDB (default) or PostgreSQL
- SMTP credentials (for email features)

## Quickstart

1) Install
```bash
cd certification_system_backend
npm install
```

2) Configure environment
Create `.env` in `certification_system_backend`:
```bash
# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=certification_system
DB_DIALECT=mysql

# JWT
JWT_SECRET=change_me
JWT_EXPIRES_IN=24h

# Email (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

3) Initialize DB and run
```bash
# Create the database manually if needed (MySQL example)
mysql -u root -p -e "CREATE DATABASE certification_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Start the API
npm run dev   # development with nodemon
# or
npm start     # production
```

Health check: `GET /health` → `{ success: true }`

## Core Routes

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Certificates (public):
  - `GET /api/certificates/verify/:certificateId`
  - `GET /api/certificates/download/:certificateId`
- Certificates (admin):
  - `GET /api/certificates/admin`
  - `GET /api/certificates/category/:categoryId`
  - `POST /api/certificates/admin/templates` (upload template)
  - `POST /api/certificates/admin/generate` (bulk generate; CSV + template + optional mapping)
  - `POST /api/certificates/admin/generate-single`
  - `PUT /api/certificates/:id`
  - `DELETE /api/certificates/:id`
- Events: `GET /api/events`, `POST /api/events`, `GET /api/events/:id`, `PUT /api/events/:id`, `DELETE /api/events/:id`
- Categories: `GET /api/categories`, `POST /api/categories`, `GET /api/categories/:id`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`
- Emails: `POST /api/emails/bulk`, `POST /api/emails/send/:certificateId`, `GET /api/emails/status`

## Bulk Generation

Endpoint: `POST /api/certificates/admin/generate`

Authorization: Bearer token (admin)

Multipart form-data fields:
- `csv`: CSV file (required)
- `template`: PNG/JPG template image (required)
- `mapping`: JSON file (optional)
- `eventId`: positive integer ID of an existing event (required)

Example (cURL):
```bash
curl -X POST "http://localhost:3000/api/certificates/admin/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -F "csv=@./sample.csv" \
  -F "template=@./Certificate.png" \
  -F "mapping=@./mapping.json" \
  -F "eventId=1"
```

### CSV example
Minimum required headers: `name`, `email`. Any additional columns are available to mapping as fields.

```csv
name,email,team,rank
Alice Johnson,alice@example.com,Blue,1
Bob Singh,bob@example.com,Red,2
```

### mapping.json example
Mapping controls where and how each field is rendered on the template. Coordinates are in pixels relative to the original template used to design the mapping. If the runtime template size differs, the system scales coordinates automatically.

```json
{
  "template": { "width": 1600, "height": 1131 },
  "fields": {
    "name": {
      "x": 800, "y": 520,
      "fontSize": 64, "fontWeight": "bold",
      "color": "#333333", "textAlign": "center",
      "fontFamily": "Amsterdam"
    },
    "eventName": {
      "x": 800, "y": 650,
      "fontSize": 36, "color": "#444444",
      "textAlign": "center"
    },
    "eventDate": {
      "x": 800, "y": 720,
      "fontSize": 28, "color": "#555555",
      "textAlign": "center"
    },
    "certificateNumber": {
      "x": 800, "y": 1030,
      "fontSize": 18, "color": "#666666",
      "textAlign": "center",
      "prefix": "Certificate #"
    },
    "team": {
      "x": 300, "y": 900,
      "fontSize": 22, "color": "#333333"
    },
    "rank": {
      "x": 1300, "y": 900,
      "fontSize": 22, "color": "#333333",
      "prefix": "Rank: "
    }
  }
}
```

Supported field keys include core fields: `name`, `eventName`, `eventDate`, `certificateNumber`, plus any column headers from your CSV (e.g., `team`, `rank`). The generator also accepts common aliases (e.g., `recipientName`, `event`, `date`, `certificate_id`).

Outputs are saved to `uploads/certificates/` and served at `GET /uploads/certificates/:filename`. The response includes both file path and a URL derived from `BASE_URL`.

## Single Generation

Endpoint: `POST /api/certificates/admin/generate-single`
Payload:
```json
{
  "recipientName": "Alice Johnson",
  "recipientEmail": "alice@example.com",
  "eventId": 1,
  "templatePath": "absolute/or/server-path/to/template.png"
}
```

## Notes & Conventions

- Template files must be images (`.png`, `.jpg`, `.jpeg`).
- `eventId` is a positive integer and must exist.
- Fonts: Amsterdam.ttf is bundled under `fonts/` and used for `name` by default when specified in mapping.
- Errors are returned as JSON with `success: false` and a descriptive `message`.

## Project Structure (key paths)

- `app.js` – server bootstrap, middleware, routes
- `routes/` – HTTP routes (auth, categories, events, certificates, emails)
- `controllers/` – business logic
- `models/` – Sequelize models
- `utils/certificateGenerator.js` – Sharp overlay and mapping engine
- `uploads/` – persisted templates, csv, and generated certificates

## License

MIT


