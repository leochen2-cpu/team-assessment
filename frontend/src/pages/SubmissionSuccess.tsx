import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './SubmissionSuccess.css';

interface LocationState {
  name: string;
  email: string;
}

function SubmissionSuccess() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // 如果没有state，跳回首页
  useEffect(() => {
    if (!state || !state.name || !state.email) {
      navigate('/survey');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon-large">✓</div>
        
        <h1 className="success-title">Assessment Completed!</h1>
        <p className="success-subtitle">Thank you, {state.name}! Your assessment has been successfully submitted.</p>

        <div className="success-content">
          {/* What's Next Section */}
          <div className="info-section">
            <div className="section-header">
              <span className="section-icon">📋</span>
              <h3>What's Next?</h3>
            </div>
            <div className="section-content">
              <p className="section-text">Your responses have been recorded.</p>
              <p className="section-text">Once all team members complete the assessment, reports will be generated.</p>
            </div>
          </div>

          {/* Email Report Section */}
          <div className="info-section">
            <div className="section-header">
              <span className="section-icon">📧</span>
              <h3>Your Report Will Be Sent To:</h3>
            </div>
            <div className="section-content">
              <p className="email-display">{state.email}</p>
            </div>
          </div>

          {/* Report Contents Section */}
          <div className="info-section">
            <div className="section-header">
              <span className="section-icon">📊</span>
              <h3>You'll Receive a Detailed Report With:</h3>
            </div>
            <div className="section-content">
              <ul className="report-features">
                <li>Your personal scores across 7 dimensions</li>
                <li>Comparison with team averages</li>
                <li>Personalized recommendations</li>
              </ul>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="timeline-box">
            <div className="timeline-icon">⏱️</div>
            <div className="timeline-content">
              <h4>Expected Timeline</h4>
              <p>Reports are typically sent within 24-48 hours after all team members complete their assessments.</p>
            </div>
          </div>
        </div>

        <div className="success-footer">
          <p className="footer-note">
            <span className="lock-icon">🔒</span>
            <strong>Privacy Protected:</strong> Your individual responses are confidential. Only aggregated team data will be shared with administrators.
          </p>
          
          <p className="closing-message">
            If you have any questions, please contact your team administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SubmissionSuccess;




