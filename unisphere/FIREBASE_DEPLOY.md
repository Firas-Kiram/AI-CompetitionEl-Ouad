# Deploying UniSphere to Firebase Hosting

This guide will help you deploy the UniSphere application to Firebase Hosting.

## Prerequisites

- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Expo CLI installed (`npm install -g expo-cli`)

## Deployment Steps

1. **Login to Firebase**

   ```bash
   firebase login
   ```

2. **Build the web version of your Expo app**

   ```bash
   npm run build:web
   ```

   This command will create a `web-build` directory with your compiled web app.

3. **Deploy to Firebase**

   ```bash
   firebase deploy --only hosting
   ```
   
   Or you can use the combined command:
   
   ```bash
   npm run deploy
   ```

4. **Access your deployed app**

   After deployment completes, you'll see a URL where your app is hosted, typically:
   https://unisphere-af6b8.web.app

## Configuration Files

- `firebase.json`: Configures Firebase Hosting settings
- `.firebaserc`: Specifies the Firebase project to use
- `firebase.js`: Contains Firebase SDK initialization code

## Troubleshooting

- If you encounter CORS issues, you may need to configure your API backend to accept requests from your Firebase domain.
- Check the Firebase console for detailed logs if deployment fails.
- Ensure your app works correctly in web mode locally before deploying.

## Important Notes

- Remember to update your API base URL in the app to point to your deployed backend:
  ```javascript
  const API_BASE_URL = 'https://your-backend-url.com/api';
  ```
- Some native features may not work in web mode. Test thoroughly after deployment. 