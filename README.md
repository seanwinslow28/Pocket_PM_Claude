# Pocket PM Backend

Backend API for Pocket PM - AI-powered product analysis tool.

## Features
- User authentication (JWT)
- OpenAI integration for product analysis
- PostgreSQL database
- RESTful API endpoints

## Local Development
```bash
cd pocket-pm-project/pocket-pm-backend
npm install
npm run dev
```

## Environment Setup
Create a `.env` file in the `pocket-pm-project/pocket-pm-backend/` directory with:
```
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
PORT=3001
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Analysis
- `POST /api/analyze` - Generate AI product analysis (requires authentication)

### Health Check
- `GET /health` - Server health status

## Tech Stack
- Node.js + Express.js
- PostgreSQL database
- OpenAI GPT-4 API
- JWT authentication
- bcrypt password hashing

## Project Structure
```
pocket-pm-project/
└── pocket-pm-backend/
    ├── server.js          # Main server file
    ├── package.json       # Dependencies
    ├── .env              # Environment variables (not committed)
    └── .gitignore        # Git ignore rules
``` 