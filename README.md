# Security Audit Log Dashboard

A production-ready full-stack web application designed for security engineers to upload, view, and investigate system audit logs. This project strictly adheres to the requested specifications.

## Features

- **Bulk Upload**: Accepts and stores up to 10,000 JSON log records in a single request, with thorough server-side validation.
- **Server-Side Operations**: Fully implements server-side pagination, searching, sorting, and filtering for high performance on large datasets.
- **Dashboard UI**: Professional, clean, and responsive enterprise dashboard built with React (Vite) and Vanilla CSS, prioritizing usability and accessibility.
- **Optimized Database**: MongoDB schema with proper indexes for fast query resolution.

## Technical Decisions

1. **Architecture Stack**: Node.js and Express handle the backend API, utilizing Mongoose for structured interactions with MongoDB. React initialized via Vite ensures a lightning-fast modern frontend development experience.
2. **Database Queries**: Used `.lean()` in Mongoose to bypass hydrating Mongoose documents when fetching data, improving read performance. `Log.insertMany()` was chosen for optimal performance when saving bulk logs.
3. **Payload Limits**: The Express JSON middleware limit was increased to `10mb` to safely process arrays containing 10,000 JSON objects.
4. **Validation**: All validation for the uploaded logs is performed on the server-side to guarantee data integrity before executing `insertMany()`.
5. **No Extraneous Features**: Purposefully excluded authentication, complex charts, websockets, glassmorphism UI, and other non-specified features to remain completely faithful to the assignment scope.

## Environment Variables

Ensure you create a `.env` file in the `server/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/audit-logs
```

*Note: Replace the `MONGODB_URI` with your own MongoDB connection string if you are not running a local instance.*

## Setup Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   # Or for development with nodemon:
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

## Deliverables

- **GitHub Repository**: [Insert Link Here]
- **Deployment Link**: [Insert Link Here]
