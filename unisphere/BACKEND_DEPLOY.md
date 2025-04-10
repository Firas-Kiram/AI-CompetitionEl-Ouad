# Deploying UniSphere Backend to Firebase Functions

This guide will help you deploy the UniSphere backend API to Firebase Functions.

## Prerequisites

- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase account and project created (same project as your frontend)

## Deployment Steps

1. **Setup Firebase Functions in your backend directory**

   Navigate to your backend directory and initialize Firebase Functions:

   ```bash
   cd path/to/your/backend
   firebase init functions
   ```

   When prompted:
   - Select your existing Firebase project
   - Choose JavaScript
   - Say Yes to ESLint
   - Say Yes to installing dependencies

2. **Modify your backend code**

   You'll need to adapt your Express app to work with Firebase Functions. Create an `index.js` file in the functions directory:

   ```javascript
   const functions = require('firebase-functions');
   const express = require('express');
   const cors = require('cors');
   const helmet = require('helmet');
   const morgan = require('morgan');
   
   const app = express();
   
   // Middleware
   app.use(cors({
     origin: ['http://localhost:19006', 'https://unisphere-af6b8.web.app', 'https://unisphere-af6b8.firebaseapp.com'],
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   app.use(helmet());
   app.use(express.json());
   app.use(morgan('dev'));
   
   // Import your routes
   const userRoutes = require('./routes/users');
   const eventRoutes = require('./routes/events');
   // ... other routes
   
   // API routes
   app.use('/api/users', userRoutes);
   app.use('/api/events', eventRoutes);
   // ... other route usage
   
   // Basic route for testing
   app.get('/api', (req, res) => {
     res.json({ 
       message: 'Welcome to UniSphere API', 
       status: 'online',
       environment: process.env.NODE_ENV || 'development'
     });
   });
   
   // Export the Express app as a Firebase Function
   exports.api = functions.https.onRequest(app);
   ```

3. **Update your Firebase Functions configuration**

   In the `functions/package.json` file, add your dependencies:

   ```json
   "dependencies": {
     "express": "^4.18.2",
     "cors": "^2.8.5",
     "helmet": "^7.1.0",
     "morgan": "^1.10.0",
     "firebase-admin": "^11.11.0",
     "firebase-functions": "^4.5.0",
     // ... other dependencies your backend uses
   }
   ```

4. **Deploy to Firebase Functions**

   ```bash
   firebase deploy --only functions
   ```

5. **Get your API URL**

   After deployment, Firebase will provide you with a URL for your API function:
   ```
   https://us-central1-unisphere-af6b8.cloudfunctions.net/api
   ```

6. **Update your frontend code**

   Update the API_BASE_URL in your frontend code:

   ```javascript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://us-central1-unisphere-af6b8.cloudfunctions.net/api'
     : 'http://localhost:3000/api';
   ```

## Troubleshooting

- **CORS issues**: Ensure your CORS configuration includes all domains that will access your API
- **Database connection**: If using a database, ensure you're using the correct connection string for the production environment
- **Environment variables**: Set up environment variables in Firebase Functions for sensitive information

## Testing Your API

You can test your deployed API using tools like Postman or cURL:

```bash
curl https://us-central1-unisphere-af6b8.cloudfunctions.net/api
```

## Local Development

For local development of Firebase Functions:

```bash
cd functions
npm run serve
```

This will start your functions locally, typically on port 5001:
```
http://localhost:5001/unisphere-af6b8/us-central1/api
``` 