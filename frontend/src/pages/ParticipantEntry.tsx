import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ParticipantEntry.css';

function ParticipantEntry() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证code格式
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter your access code');
      return;
    }

    if (cleanCode.length !== 8) {
      setError('Access code must be 8 characters');
      return;
    }

    setIsValidating(true);

    try {
      // 验证code是否有效并检查是否已使用
      const response = await fetch(`http://localhost:3001/api/assessments/validate/${cleanCode}`);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid access code');
      }

      if (!data.valid) {
        throw new Error('Invalid access code');
      }

      // 🚨 关键：在这里检查 code 是否已被使用
      if (data.code && data.code.isUsed === true) {
        throw new Error('This access code has already been used. Each code can only be submitted once. Please contact your team administrator if you need a new code.');
      }

      // Code有效且未使用，跳转到身份信息页面
      navigate(`/survey/${cleanCode}/info`);
    } catch (err: any) {
      console.error('Validation error:', err);
      setError(err.message || 'Failed to validate code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许大写字母和数字
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(value);
  };

  return (
    <div className="participant-container">
      <div className="participant-card">
        <div className="participant-header">
          <div className="header-icon">🎯</div>
          <h1>Team Assessment Survey</h1>
          <p>Enter your unique access code to begin</p>
        </div>

        <form onSubmit={handleSubmit} className="participant-form">
          <div className="form-group">
            <label htmlFor="code" className="form-label">
              Access Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 8-character code"
              className="form-input code-input"
              maxLength={8}
              disabled={isValidating}
              autoFocus
            />
            <p className="form-hint">
              💡 Your access code was provided by your team administrator
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-continue"
            disabled={isValidating || code.length !== 8}
          >
            {isValidating ? (
              <>
                <span className="spinner"></span>
                Validating...
              </>
            ) : (
              'Continue →'
            )}
          </button>
        </form>

        <div className="participant-footer">
          <p className="footer-text">
            This assessment takes approximately 5-7 minutes to complete
          </p>
        </div>
      </div>
    </div>
  );
}

export default ParticipantEntry;