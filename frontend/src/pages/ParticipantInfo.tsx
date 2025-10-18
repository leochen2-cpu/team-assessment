import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ParticipantInfo.css';

function ParticipantInfo() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // 跳转到问卷页面，带上code, name, email
    navigate(`/survey/${code}/questions`, {
      state: {
        code,
        name: name.trim(),
        email: email.trim(),
      },
    });
  };

  return (
    <div className="info-container">
      <div className="info-card">
        <div className="info-header">
          <div className="header-icon">👤</div>
          <h1>Welcome!</h1>
          <p>Please provide your information to continue</p>
        </div>

        <div className="code-display">
          <span className="code-label">Your Access Code:</span>
          <span className="code-value">{code}</span>
        </div>

        <form onSubmit={handleSubmit} className="info-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="form-input"
            />
            <p className="form-hint">
              📧 Your personalized report will be sent to this email
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="btn-start">
            Start Assessment →
          </button>
        </form>

        <div className="info-footer">
          <div className="privacy-note">
            <p>🔒 Your information is confidential</p>
            <p className="privacy-text">
              Individual responses are private. Only aggregated team data will be shared with administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantInfo;
