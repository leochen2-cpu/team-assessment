import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAssessment.css';

interface ParticipantEmail {
  id: string;
  email: string;
}

// 🆕 新增：组织类型定义
interface Organization {
  id: string;
  name: string;
  leaderName: string;
}

function CreateAssessment() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [participants, setParticipants] = useState<ParticipantEmail[]>([
    { id: '1', email: '' },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🆕 新增：组织相关状态
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);

  // 🆕 新增：加载组织列表
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrgs(true);
        const response = await fetch('http://localhost:3001/api/admin/organizations?format=flat&includeInactive=false');
        
        if (!response.ok) {
          throw new Error('Failed to load organizations');
        }

        const result = await response.json();
        setOrganizations(result.data || []);
      } catch (error) {
        console.error('Failed to load organizations:', error);
        // 不显示错误，只是组织选择器会为空
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  // 添加新的参与者输入框
  const addParticipant = () => {
    const newId = (participants.length + 1).toString();
    setParticipants([...participants, { id: newId, email: '' }]);
  };

  // 删除参与者输入框
  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  // 更新参与者邮箱
  const updateParticipantEmail = (id: string, email: string) => {
    setParticipants(
      participants.map(p => (p.id === id ? { ...p, email } : p))
    );
  };

  // 验证邮箱格式
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证团队名称
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    // 获取所有非空邮箱
    const emails = participants
      .map(p => p.email.trim())
      .filter(email => email !== '');

    // 验证至少有一个参与者
    if (emails.length === 0) {
      setError('Please add at least one participant email');
      return;
    }

    // 验证所有邮箱格式
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }

    // 检查重复邮箱
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setError('Duplicate emails found. Each participant must have a unique email address.');
      return;
    }

    // 确认对话框
    if (!confirm(
      `Create assessment for "${teamName}" with ${emails.length} participant(s)?\n\n` +
      `Invitation emails will be sent automatically to all participants.`
    )) {
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch('http://localhost:3001/api/admin/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          participantEmails: emails,
          createdBy: localStorage.getItem('adminUsername') || 'Admin',
          organizationId: selectedOrgId || undefined, // 🆕 新增：添加组织ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assessment');
      }

      const data = await response.json();

      // 显示成功消息
      alert(
        `✅ Assessment Created Successfully!\n\n` +
        `Team: ${teamName}\n` +
        `Participants: ${emails.length}\n\n` +
        `Invitation emails have been sent to all participants with their unique access codes.`
      );

      // 跳转到评估详情页面
      navigate(`/admin/assessment/${data.assessment.id}`);
    } catch (err: any) {
      console.error('Create assessment error:', err);
      setError(err.message || 'Failed to create assessment');
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 检查登录状态
  useState(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  });

  return (
    <div className="create-container">
      <div className="create-card">
        <div className="create-header">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
          <h1>📝 Create New Assessment</h1>
          <p>Set up a new team effectiveness assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          {/* 团队名称 */}
          <div className="form-section">
            <label htmlFor="teamName" className="form-label">
              Team Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Marketing Team Q1, Engineering Sprint Team"
              className="form-input"
              disabled={isCreating}
              autoFocus
            />
            <p className="form-hint">
              Choose a descriptive name for this assessment
            </p>
          </div>

          {/* 🆕 新增：组织选择 */}
          <div className="form-section">
            <label htmlFor="organizationId" className="form-label">
              Organization (Optional)
            </label>
            <select
              id="organizationId"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="form-input"
              disabled={isCreating || isLoadingOrgs}
              style={{ cursor: 'pointer' }}
            >
              <option value="">No Organization (Standalone Assessment)</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} - {org.leaderName}
                </option>
              ))}
            </select>
            <p className="form-hint">
              {isLoadingOrgs ? (
                '⏳ Loading organizations...'
              ) : organizations.length === 0 ? (
                '📝 No organizations available. You can create one in Organization Management.'
              ) : (
                '📊 Select an organization to include this assessment in organization reports'
              )}
            </p>
          </div>

          {/* 参与者邮箱列表 */}
          <div className="form-section">
            <div className="section-header">
              <label className="form-label">
                Participant Emails <span className="required">*</span>
              </label>
              <span className="participant-count">
                {participants.filter(p => p.email.trim()).length} participant(s)
              </span>
            </div>
            <p className="form-hint" style={{ marginBottom: '1rem' }}>
              📧 Each participant will receive an email with their unique access code
            </p>

            <div className="participants-list">
              {participants.map((participant, index) => (
                <div key={participant.id} className="participant-row">
                  <span className="participant-number">{index + 1}</span>
                  <input
                    type="email"
                    value={participant.email}
                    onChange={(e) => updateParticipantEmail(participant.id, e.target.value)}
                    placeholder="participant@example.com"
                    className="participant-input"
                    disabled={isCreating}
                  />
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(participant.id)}
                      className="btn-remove"
                      disabled={isCreating}
                      title="Remove participant"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addParticipant}
              className="btn-add-participant"
              disabled={isCreating}
            >
              ➕ Add Another Participant
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn-cancel"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isCreating || !teamName.trim() || participants.filter(p => p.email.trim()).length === 0}
            >
              {isCreating ? (
                <>
                  <span className="spinner"></span>
                  Creating & Sending Emails...
                </>
              ) : (
                <>
                  ✉️ Create Assessment & Send Invites
                </>
              )}
            </button>
          </div>

          {/* 说明信息 */}
          <div className="info-box">
            <h3>📋 What happens next?</h3>
            <ul>
              <li>✅ Each participant will receive an email with their unique access code</li>
              <li>✅ They can click the link in the email to start the assessment</li>
              <li>✅ You can send reminder emails to participants who haven't completed</li>
              <li>✅ Once everyone completes, you can generate the team report</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAssessment;