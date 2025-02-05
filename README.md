# Pushup Tracker

A web application for tracking daily pushups and maintaining streaks. Built with React, TypeScript, and MongoDB.

## Features

- Track daily pushup counts
- Set and monitor daily goals
- View your current and longest streaks
- See your progress over time with charts
- Get motivated with daily inspirational quotes
- Works without an account (data stored locally)
- Optional account creation to sync data across devices

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - React Query
  - Chart.js
  - Vite

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pushup-tracker.git
   cd pushup-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=5001
   MONGODB_URI=mongodb://pushupapp:pushup123@localhost:27017/pushups
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## Usage

1. Visit the site and start tracking pushups immediately (no account required)
2. Set your daily pushup goal
3. Record your pushups each day
4. Watch your streak grow!
5. Optionally create an account to save your progress

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

