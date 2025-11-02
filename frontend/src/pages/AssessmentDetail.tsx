import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AssessmentDetail.css';

interface Code {
  id: string;
  code: string;
  isUsed: boolean;
  name: string | null;
  email: string | null;
  submittedAt: string | null;
}

interface Assessment {
  id: string;
  teamName: string;
  memberCount: number;
  submittedCount: number;
  status: string;
  createdAt: string;
  createdBy: string;
  codes: Code[];
  teamReport: any | null;
}

function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false); // ⬅️ 新增：提醒邮件状态

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    fetchAssessmentDetail();
  }, [id, navigate]);

  const fetchAssessmentDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/admin/assessments/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessment details');
      }

      const data = await response.json();
      setAssessment(data.assessment);
    } catch (err: any) {
      console.error('Fetch assessment detail error:', err);
      setError(err.message || 'Failed to load assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateReport = async () => {
    if (!assessment) return;

    try {
      setIsCalculating(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/admin/assessments/${id}/calculate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate report');
      }

      const data = await response.json();

      // 计算成功后跳转到团队报告页面
      if (data.success) {
        navigate(`/admin/assessment/${id}/report`);
      }
    } catch (err: any) {
      console.error('Calculate report error:', err);
      setError(err.message);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSendEmails = async () => {
    if (!assessment) return;

    // 确认对话框
    if (!confirm(`Send personal reports to all ${assessment.submittedCount} participants?`)) {
      return;
    }

    try {
      setIsSendingEmails(true);
      setError(null);

      console.log('🚀 Sending emails to:', assessment.submittedCount, 'participants');

      const response = await fetch(
        `http://localhost:3001/api/admin/assessments/${id}/send-reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📧 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || 'Failed to send emails');
      }

      const data = await response.json();
      console.log('✅ Success response:', data);

      alert(
        `✅ Email Sending Complete!\n\n` +
        `Total: ${data.result.total}\n` +
        `Success: ${data.result.success}\n` +
        `Failed: ${data.result.failed}`
      );

      // 刷新页面数据
      await fetchAssessmentDetail();
    } catch (err: any) {
      console.error('❌ Send emails error:', err);
      setError(err.message);
      alert(`❌ Error: ${err.message}\n\nCheck the browser console and backend logs for details.`);
    } finally {
      setIsSendingEmails(false);
    }
  };

  // ⬇️⬇️⬇️ 新增：发送提醒邮件的处理函数 ⬇️⬇️⬇️
  const handleSendReminders = async () => {
    if (!assessment) return;

    const pendingCount = assessment.memberCount - assessment.submittedCount;
    
    if (pendingCount === 0) {
      alert('✅ All participants have completed the survey!');
      return;
    }

    // 确认对话框
    if (!confirm(`Send reminder emails to ${pendingCount} participant(s) who haven't completed the survey?`)) {
      return;
    }

    try {
      setIsSendingReminders(true);
      setError(null);

      console.log('📧 Sending reminder emails to:', pendingCount, 'participants');

      const response = await fetch(
        `http://localhost:3001/api/admin/assessments/${id}/send-reminders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📧 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || 'Failed to send reminder emails');
      }

      const data = await response.json();
      console.log('✅ Reminders sent:', data);

      alert(
        `✅ Reminder Emails Sent!\n\n` +
        `Total: ${data.result.total}\n` +
        `Success: ${data.result.success}\n` +
        `Failed: ${data.result.failed}`
      );
      
      // 刷新页面数据
      await fetchAssessmentDetail();
    } catch (err: any) {
      console.error('❌ Send reminders error:', err);
      setError(err.message);
      alert(`❌ Error: ${err.message}\n\nCheck the browser console and backend logs for details.`);
    } finally {
      setIsSendingReminders(false);
    }
  };
  // ⬆️⬆️⬆️ 新增结束 ⬆️⬆️⬆️

  const handleViewReport = () => {
    navigate(`/admin/assessment/${id}/report`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copied to clipboard!`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="detail-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="detail-container">
        <div className="error-card">
          <h2>❌ Error</h2>
          <p className="error-message">{error || 'Assessment not found'}</p>
          <button onClick={() => navigate('/admin/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completionPercentage = (assessment.submittedCount / assessment.memberCount) * 100;
  const isComplete = assessment.submittedCount === assessment.memberCount;
  const pendingCount = assessment.memberCount - assessment.submittedCount; // ⬅️ 新增：计算待完成人数

  return (
    <div className="detail-container">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <h1>{assessment.teamName}</h1>
        <p>Assessment Details</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-box">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Team Size</span>
            <span className="stat-value">{assessment.memberCount}</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Submissions</span>
            <span className="stat-value">
              <span className="stat-highlight">{assessment.submittedCount}</span>
              <span className="stat-divider">/</span>
              {assessment.memberCount}
            </span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-label">Progress</span>
            <span className="stat-value">{Math.round(completionPercentage)}%</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">
            {isComplete ? '✅' : assessment.submittedCount > 0 ? '⏳' : '⭕'}
          </div>
          <div className="stat-content">
            <span className="stat-label">Status</span>
            <span className={`stat-value status-${assessment.status.toLowerCase()}`}>
              {assessment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar-large">
          <div 
            className="progress-fill-large"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="progress-text">
          {assessment.submittedCount} of {assessment.memberCount} team members have completed the assessment
        </p>
      </div>

      {/* ⬇️⬇️⬇️ 新增：提醒邮件按钮（显示在未完成时） ⬇️⬇️⬇️ */}
      {!isComplete && pendingCount > 0 && (
        <div className="actions-section">
          <button 
            onClick={handleSendReminders}
            disabled={isSendingReminders}
            className="btn-reminder btn-large"
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              cursor: isSendingReminders ? 'not-allowed' : 'pointer',
              opacity: isSendingReminders ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
            }}
          >
            {isSendingReminders ? (
              <>
                <span className="spinner"></span>
                Sending Reminders...
              </>
            ) : (
              <>
                ⏰ Send Reminder Emails
                <span style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  {pendingCount} pending
                </span>
              </>
            )}
          </button>
        </div>
      )}
      {/* ⬆️⬆️⬆️ 新增结束 ⬆️⬆️⬆️ */}

      {/* Actions */}
      {isComplete && (
        <div className="actions-section">
          {assessment.teamReport ? (
            <button 
              onClick={handleViewReport}
              className="btn-primary btn-large"
            >
              📊 View Team Report
            </button>
          ) : (
            <button 
              onClick={handleCalculateReport}
              className="btn-primary btn-large"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <span className="spinner"></span>
                  Calculating...
                </>
              ) : (
                '📊 Calculate Team Report'
              )}
            </button>
          )}
          
          <button 
            onClick={handleSendEmails}
            className="btn-secondary btn-large"
            disabled={isSendingEmails || !assessment.teamReport}
          >
            {isSendingEmails ? (
              <>
                <span className="spinner"></span>
                Sending Emails...
              </>
            ) : (
              '📧 Send Email Reports'
            )}
          </button>
        </div>
      )}

      {/* Team Report Summary (if exists) */}
      {assessment.teamReport && (
        <div className="report-section">
          <h2>📈 Team Report Summary</h2>
          <div className="report-card">
            <div className="report-header">
              <div className="report-score">
                <span className="score-label">Team Score</span>
                <span className="score-value">{assessment.teamReport.teamScore.toFixed(1)}</span>
                <span className="score-badge">
                  {assessment.teamReport.healthGrade || 'Good'}
                </span>
              </div>
            </div>

            <div className="report-dimensions">
              <h3>Dimension Scores</h3>
              <div className="dimensions-grid">
                {Object.entries(JSON.parse(assessment.teamReport.dimensionScores || '{}')).map(([key, value]) => (
                  <div key={key} className="dimension-item">
                    <span className="dimension-name">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <span className="dimension-score">{(value as number).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-meta">
              <p>
                <strong>Consistency Factor:</strong> {assessment.teamReport.consistencyFactor.toFixed(2)}
              </p>
              <p>
                <strong>Participation:</strong> {assessment.teamReport.participationCount} members
              </p>
            </div>

            <button 
              onClick={handleViewReport}
              className="btn-primary"
              style={{ marginTop: '1.5rem' }}
            >
              View Full Report →
            </button>
          </div>
        </div>
      )}

      {/* Codes List */}
      <div className="codes-section">
        <h2>🔑 Access Codes</h2>
        <div className="codes-table">
          <div className="table-header">
            <div className="th-code">Code</div>
            <div className="th-status">Status</div>
            <div className="th-participant">Participant</div>
            <div className="th-email">Email</div>
            <div className="th-submitted">Submitted At</div>
            <div className="th-action">Action</div>
          </div>

          {assessment.codes.map((codeItem, index) => (
            <div key={codeItem.id} className={`table-row ${codeItem.isUsed ? 'row-used' : 'row-unused'}`}>
              <div className="td-code">
                <span className="code-number">#{index + 1}</span>
                <span className="code-value">{codeItem.code}</span>
              </div>
              <div className="td-status">
                {codeItem.isUsed ? (
                  <span className="badge badge-success">✓ Used</span>
                ) : (
                  <span className="badge badge-pending">○ Pending</span>
                )}
              </div>
              <div className="td-participant">
                {codeItem.name || <span className="text-muted">-</span>}
              </div>
              <div className="td-email">
                {codeItem.email || <span className="text-muted">-</span>}
              </div>
              <div className="td-submitted">
                {codeItem.submittedAt ? (
                  formatDate(codeItem.submittedAt)
                ) : (
                  <span className="text-muted">-</span>
                )}
              </div>
              <div className="td-action">
                <button 
                  onClick={() => handleCopyCode(codeItem.code)}
                  className="btn-copy-mini"
                  title="Copy code"
                >
                  📋
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="detail-footer">
        <p>Created by <strong>{assessment.createdBy}</strong> on {formatDate(assessment.createdAt)}</p>
      </div>
    </div>
  );
}

export default AssessmentDetail;