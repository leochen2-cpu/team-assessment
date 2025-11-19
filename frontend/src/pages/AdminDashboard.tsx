import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

interface Assessment {
  id: string;
  teamName: string;
  memberCount: number;
  submittedCount: number;
  status: string;
  createdAt: string;
  createdBy: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchAssessments();
}, []);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/admin/assessments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }

      const data = await response.json();
      setAssessments(data.assessments || []);
    } catch (err: any) {
      console.error('Fetch assessments error:', err);
      setError(err.message || 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (submittedCount: number, memberCount: number) => {
    if (submittedCount === 0) return 'status-not-started';
    if (submittedCount === memberCount) return 'status-complete';
    return 'status-in-progress';
  };

  const getStatusText = (submittedCount: number, memberCount: number) => {
    if (submittedCount === 0) return 'Not Started';
    if (submittedCount === memberCount) return 'Complete';
    return 'In Progress';
  };

  if (isLoading) {
    return (
      <div className="admin-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-card">
          <h2>❌ Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={fetchAssessments} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* ✅ 简化的标题部分 */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage team assessments</p>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Actions Bar */}
        <div className="actions-bar">
          <button 
            onClick={() => navigate('/admin/create')}
            className="btn-primary btn-large"
          >
            ➕ Create New Assessment
          </button>
        </div>

        {/* Assessments List */}
        {assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Assessments Yet</h2>
            <p>Create your first team assessment to get started</p>
            <button 
              onClick={() => navigate('/admin/create')}
              className="btn-primary"
            >
              Create Assessment
            </button>
          </div>
        ) : (
          <div className="assessments-grid">
            {assessments.map((assessment) => (
              <div 
                key={assessment.id}
                className="assessment-card"
                onClick={() => navigate(`/admin/assessment/${assessment.id}`)}
              >
                <div className="card-header">
                  <h3>{assessment.teamName}</h3>
                  <span className={`status-badge ${getStatusColor(assessment.submittedCount, assessment.memberCount)}`}>
                    {getStatusText(assessment.submittedCount, assessment.memberCount)}
                  </span>
                </div>

                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Team Size</span>
                    <span className="stat-value">{assessment.memberCount} members</span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Submissions</span>
                    <span className="stat-value">
                      <span className="stat-highlight">{assessment.submittedCount}</span>
                      <span className="stat-divider">/</span>
                      {assessment.memberCount}
                    </span>
                  </div>
                </div>

                <div className="card-progress">
                  <div className="progress-bar-mini">
                    <div 
                      className="progress-fill-mini"
                      style={{ 
                        width: `${(assessment.submittedCount / assessment.memberCount) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="progress-text-mini">
                    {Math.round((assessment.submittedCount / assessment.memberCount) * 100)}% complete
                  </span>
                </div>

                <div className="card-footer">
                  <span className="footer-info">
                    📅 Created {formatDate(assessment.createdAt)}
                  </span>
                  <span className="footer-info">
                    👤 by {assessment.createdBy}
                  </span>
                </div>

                <div className="card-hover-overlay">
                  <span>View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
