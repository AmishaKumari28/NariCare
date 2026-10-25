# NariCare 💜

### Your Health. Your Care. Your Companion.

**NariCare: A Comprehensive Women's Health and Wellness Management System**

NariCare is a full-stack web application designed to help women track and understand their menstrual health, symptoms, and wellness information through a simple, accessible dashboard.

## Problem Statement

Menstrual health information is often scattered across different apps, notes, and personal records. This can make it difficult to recognize patterns, maintain consistent records, and communicate health history during medical consultations.

## Our Solution

NariCare brings menstrual cycle tracking, symptom recording, health insights, and downloadable doctor reports together in one application.

## Key Features

- **User Authentication:** Registration, login, and protected dashboard access.
- **Health Dashboard:** Overview of personal health tracking information.
- **Symptom Tracker:** Record symptoms, severity, dates, and notes.
- **Menstrual Cycle Tracker:** Track menstrual periods and cycle history.
- **Health Insights:** View calculated summaries and patterns from recorded data.
- **Doctor Report:** Generate downloadable PDF reports containing health history and calculated averages.
- **Health Awareness:** Access women's health and wellness information.
- **Settings:** Manage available account preferences.
- **Responsive Design:** Interface designed for desktop and mobile screens.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT |
| PDF Generation | jsPDF |
| Icons | Lucide React |
| Version Control | Git, GitHub |

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/NariCare.git
cd NariCare
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file with the environment variables required by your backend, including your MongoDB connection string and JWT secret. Use the exact variable names expected by your backend code.

Start the backend:

```bash
npm start
```

If your backend uses a different development script, use the corresponding command from `backend/package.json`.

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal.

The development frontend currently connects to the API at `http://localhost:5000/api`.

## How NariCare Works

1. Users create an account and log in.
2. Users record menstrual cycles and symptoms.
3. The dashboard and insights pages display recorded information.
4. Users can generate a PDF summary for discussion with a healthcare professional.

## Privacy and Medical Disclaimer

NariCare handles personal health information. Users should avoid sharing sensitive reports publicly.

The application's insights and reports are based on self-recorded information. NariCare is not a medical diagnosis tool and does not replace professional medical advice.

## Future Enhancements

- Personalized reminders
- Improved visual health analytics
- Optional multilingual support
- Additional privacy and security controls
- Expanded educational resources

## Project Status

Functional hackathon prototype.

## Project Name

**NariCare — Your Health. Your Care. Your Companion.**