# SamayaSync - Study Session Tracker

SamayaSync is a comprehensive web application designed to help users track their study sessions, set goals, and monitor their progress. Built with the MERN stack (MongoDB, Express, React, Node.js), it offers a seamless experience for managing study time and staying motivated.

## Features

- **User Authentication**: Secure signup and login using JWT and Google OAuth (Passport.js).
- **Study Sessions**: Start, stop, and log study sessions with duration tracking.
- **Dashboard**: View active sessions, recent logs, and study statistics.
- **Goal Setting**: Create and manage study plans and goals.
- **Progress Tracking**: Visualize weekly progress and streak history.
- **Profile Management**: Update user profile and settings.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing.

## Technology Stack

### Frontend
- **React**: UI library for building the user interface.
- **React Router**: For client-side routing and navigation.
- **Axios**: for making HTTP requests to the backend.
- **Context API**: For managing global state (Auth, Theme).
- **Lucide React / React Icons**: For scalable vector icons.
- **Recharts**: For data visualization and charts.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user data and sessions.
- **Mongoose**: ODM library for MongoDB.
- **Passport.js**: Authentication middleware for Node.js (Google Strategy).
- **JWT**: JSON Web Tokens for secure authentication.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SamayaSync
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
# Optional Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

Start the backend server:
```bash
npm run dev
# or
npm start
```
The server will start on `http://localhost:5000`.

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Start the React development server:
```bash
npm start
```
The application will open in your browser at `http://localhost:3000`.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.
