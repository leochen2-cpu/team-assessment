# Team Effectiveness Assessment

A comprehensive team evaluation system based on the Gottman Method, designed to assess team dynamics across 7 key dimensions.

## 🎯 Features

### For Administrators
- Create team assessments with unique share codes
- Track submission progress in real-time
- View team aggregated reports (no access to individual scores)
- Manually or automatically send email reports when all members complete
- Monitor participation rates and team consistency

### For Team Members
- Access surveys via share code (no login required)
- Complete 27-question assessment
- One-time submission per person
- Receive personalized report via email with:
  - Individual scores
  - Personal vs Team comparison
  - Radar chart visualization

## 📊 Assessment Dimensions

1. **Team Connection** - Understanding teammates' priorities and working styles
2. **Appreciation** - Recognition and acknowledgment of contributions
3. **Responsiveness** - Active listening and constructive engagement
4. **Trust & Positivity** - Mutual trust and optimistic outlook
5. **Conflict Management** - Constructive handling of disagreements
6. **Goal Support** - Alignment and support for professional development
7. **Healthy Communication** - Absence of destructive communication patterns

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Canvas API (for radar charts)
- Axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite (development) / PostgreSQL (production)

## 📁 Project Structure

```
team-assessment/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── index.ts        # Main server
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── prisma/         # Database schema
│   └── package.json
├── frontend/                # React + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── data/           # Question data
│   │   └── service/        # API calls
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/team-assessment.git
cd team-assessment
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables

Backend `.env`:
```
DATABASE_URL="file:./dev.db"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

Frontend `.env`:
```
VITE_API_URL="http://localhost:3001/api"
```

5. Initialize database
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Running the Application

1. Start backend server
```bash
cd backend
npm run dev
```

2. Start frontend development server (in a new terminal)
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🔄 Current Status

### ✅ Completed
- 27-question assessment with 7 dimensions
- Complex scoring algorithm with weighted calculations
- Radar chart visualization
- Team score aggregation with consistency factor
- Share code generation system
- Admin assessment creation
- Response submission with duplicate prevention

### ⏳ In Progress
- Participant identity page (name + email)
- Admin dashboard for viewing team reports
- Email service integration
- Automated email sending when all members complete

### 📋 Planned
- HTML email templates with embedded radar charts
- Assessment expiration mechanism
- Admin authentication
- Data export functionality

## 📖 API Documentation

### Admin Endpoints

#### Create Assessment
```http
POST /api/admin/assessments
Content-Type: application/json

{
  "teamName": "Marketing Team Q1",
  "expectedMembers": 5
}
```

#### Get Assessment Status
```http
GET /api/admin/assessments/:shareCode
```

#### Calculate Team Report
```http
POST /api/admin/assessments/:shareCode/calculate
```

#### Send Email Reports
```http
POST /api/admin/assessments/:shareCode/send-emails
```

### Participant Endpoints

#### Validate Share Code
```http
GET /api/assessments/:shareCode/validate?email=user@example.com
```

#### Submit Assessment
```http
POST /api/assessments/:shareCode/submit
Content-Type: application/json

{
  "participantName": "John Doe",
  "participantEmail": "john@example.com",
  "responses": {
    "Q1": 4,
    "Q2": 5,
    ...
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Your Team Name

## 🙏 Acknowledgments

- Based on the Gottman Method for relationship assessment
- Inspired by team dynamics research

## 📞 Support

For questions or issues, please open an issue on GitHub or contact [your-email@example.com]
