# GKG Stigalisti

A golf team points tracking application for GKG (Golfklúbbur GKG).

## Features

- Public leaderboard showing player rankings
- Admin dashboard for managing players and points
- Points history for each player
- User authentication with admin privileges
- Fully localized in Icelandic

## Technologies

- Node.js
- Express
- MongoDB
- EJS Templates
- Bootstrap
- Passport.js for authentication

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/gkg-stigalisti.git
   cd gkg-stigalisti
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   PORT=3000
   ```

4. Start the server
   ```bash
   npm start
   ```

5. For development with auto-restart:
   ```bash
   npm run dev
   ```

## Creating an Admin User

Run the included script to create an admin user:

```bash
node create-admin.js admin@example.com password "Admin Name"
```

## Deployment

The application is ready for deployment to platforms like Render, DigitalOcean App Platform, or any Node.js hosting service.

For production deployment:
```bash
NODE_ENV=production npm start
```

## License

© 2023 GKG. All rights reserved. 