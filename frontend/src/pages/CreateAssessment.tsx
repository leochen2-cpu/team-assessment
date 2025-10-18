import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAssessment.css';

interface CreateAssessmentResponse {
  success: boolean;
  assessment: {
    id: string;
    teamName: string;
    memberCount: number;
    codes: string[];
  };
}

function CreateAssessment() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [memberCount, setMemberCount] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAssessment, setCreatedAssessment] = useState<CreateAssessmentResponse['assessment'] | null>(null);

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    const count = parseInt(memberCount);
    if (!memberCount || isNaN(count) || count < 1 || count > 100) {
      setError('Please enter a valid member count (1-100)');
      return;
    }

    if (!createdBy.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/admin/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          memberCount: count,
          createdBy: createdBy.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assessment');
      }

      const data: CreateAssessmentResponse = await response.json();
      setCreatedAssessment(data.assessment);
    } catch (err: any) {
      console.error('Create assessment error:', err);
      setError(err.message || 'Failed to create assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copied to clipboard!`);
  };

  const handleCopyAllCodes = () => {
    if (!createdAssessment) return;
    const allCodes = createdAssessment.codes.join('\n');
    navigator.clipboard.writeText(allCodes);
    alert('All codes copied to clipboard!');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  // Success state - show generated codes
  if (createdAssessment) {
    return (
      <div className="create-container">
        <div className="success-card">
          <div className="success-header">
            <div className="success-icon">✅</div>
            <h1>Assessment Created Successfully!</h1>
            <p>Here are the unique codes for your team members</p>
          </div>

          <div className="assessment-info">
            <div className="info-row">
              <span className="info-label">Team Name:</span>
              <span className="info-value">{createdAssessment.teamName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Members:</span>
              <span className="info-value">{createdAssessment.memberCount}</span>
            </div>
          </div>

          <div className="codes-section">
            <div className="codes-header">
              <h2>📋 Unique Access Codes</h2>
              <button onClick={handleCopyAllCodes} className="btn-copy-all">
                Copy All Codes
              </button>
            </div>
            
            <div className="codes-grid">
              {createdAssessment.codes.map((code, index) => (
                <div key={code} className="code-card">
                  <div className="code-number">#{index + 1}</div>
                  <div className="code-value">{code}</div>
                  <button 
                    onClick={() => handleCopyCode(code)}
                    className="btn-copy"
                  >
                    📋 Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="success-instructions">
            <h3>📝 Next Steps:</h3>
            <ol>
              <li>Share each unique code with a team member</li>
              <li>Team members can access the survey at <code>/survey</code></li>
              <li>Each code can only be used once</li>
              <li>Track progress in the assessment details page</li>
            </ol>
          </div>

          <div className="success-actions">
            <button onClick={handleBackToDashboard} className="btn-primary btn-large">
              Back to Dashboard
            </button>
            <button 
              onClick={() => navigate(`/admin/assessment/${createdAssessment.id}`)}
              className="btn-secondary btn-large"
            >
              View Assessment Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="create-container">
      <div className="create-card">
        <div className="card-header">
          <div className="header-icon">🎯</div>
          <h1>Create New Assessment</h1>
          <p>Generate unique codes for your team</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          {/* Team Name */}
          <div className="form-group">
            <label htmlFor="teamName" className="form-label">
              Team Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Marketing Team Q1"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Member Count */}
          <div className="form-group">
            <label htmlFor="memberCount" className="form-label">
              Number of Team Members <span className="required">*</span>
            </label>
            <input
              type="number"
              id="memberCount"
              value={memberCount}
              onChange={(e) => setMemberCount(e.target.value)}
              placeholder="e.g., 5"
              min="1"
              max="100"
              className="form-input"
              disabled={isLoading}
            />
            <p className="form-hint">Enter a number between 1 and 100</p>
          </div>

          {/* Created By */}
          <div className="form-group">
            <label htmlFor="createdBy" className="form-label">
              Your Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="createdBy"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="e.g., John Smith"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary btn-large btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Assessment...
              </>
            ) : (
              <>Create Assessment →</>
            )}
          </button>

          {/* Back Button */}
          <button 
            type="button"
            onClick={handleBackToDashboard}
            className="btn-text"
            disabled={isLoading}
          >
            ← Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAssessment;
