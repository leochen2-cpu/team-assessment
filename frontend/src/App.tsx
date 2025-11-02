import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CreateAssessment from './pages/CreateAssessment';
import AssessmentDetail from './pages/AssessmentDetail';
import TeamReport from './pages/TeamReport';
import ParticipantEntry from './pages/ParticipantEntry';
import ParticipantInfo from './pages/ParticipantInfo';
import SurveyQuestions from './pages/SurveyQuestions';
import SubmissionSuccess from './pages/SubmissionSuccess';
import PersonalReport from './pages/PersonalReport';  // ⬅️ 新增这一行
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* 根路径重定向到参与者入口 */}
          <Route path="/" element={<Navigate to="/survey" replace />} />
          
          {/* 管理员路由 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create" element={<CreateAssessment />} />
          <Route path="/admin/assessment/:id" element={<AssessmentDetail />} />
          <Route path="/admin/assessment/:id/report" element={<TeamReport />} />
          
          {/* 参与者路由 */}
          <Route path="/survey" element={<ParticipantEntry />} />
          <Route path="/survey/:code/info" element={<ParticipantInfo />} />
          <Route path="/survey/:code/questions" element={<SurveyQuestions />} />
          <Route path="/survey/:code/success" element={<SubmissionSuccess />} />
          <Route path="/participant/:code/report" element={<PersonalReport />} />
          
          {/* 未匹配路由重定向 */}
          <Route path="*" element={<Navigate to="/survey" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;