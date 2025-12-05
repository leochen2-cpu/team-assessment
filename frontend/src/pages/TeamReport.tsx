import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TeamReport.css';
import RecommendationCard from '../components/RecommendationCard';
import TrustMatrix from '../components/TrustMatrix';
import TrustFramework from '../components/TrustFramework';
import Tabs, { TabItem } from '../components/Tabs';
import {
  getTeamRecommendations,
  getScoreCategory,
} from '../service/recommendationService';

interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
  warningSigns: number;
}

interface TeamReportData {
  id: string;
  teamScore: number;
  baseScore: number;
  consistencyFactor: number;
  penaltyFactor: number;
  standardDeviation: number;
  dimensionScores: DimensionScores;
  participationCount: number;
  healthGrade: string;
  createdAt: string;
}

function TeamReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TeamReportData | null>(null);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    fetchTeamReport();
  }, [id]);

  const fetchTeamReport = async () => {
    try {
      // 首先获取 assessment 信息
      const assessmentRes = await fetch(`http://localhost:3001/api/admin/assessments/${id}`);
      const assessmentData = await assessmentRes.json();
      
      if (!assessmentData.success) {
        throw new Error('Failed to fetch assessment');
      }

      setTeamName(assessmentData.assessment.teamName);

      // 检查是否已有报告
      if (assessmentData.assessment.teamReport) {
        setReport({
          ...assessmentData.assessment.teamReport,
          dimensionScores: JSON.parse(assessmentData.assessment.teamReport.dimensionScores),
        });
        setLoading(false);
      } else {
        throw new Error('No team report found. Please calculate first.');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load team report');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Loading Team Report...</h2>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-container">
        <div className="error-card">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(`/admin/assessment/${id}`)} className="btn-primary">
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    return 'poor';
  };

  const dimensions = [
    { key: 'teamConnection', label: 'Team Connection', icon: '🤝' },
    { key: 'appreciation', label: 'Appreciation', icon: '🙏' },
    { key: 'responsiveness', label: 'Responsiveness', icon: '👂' },
    { key: 'trustPositivity', label: 'Trust & Positivity', icon: '✨' },
    { key: 'conflictManagement', label: 'Conflict Management', icon: '⚖️' },
    { key: 'goalSupport', label: 'Goal Support', icon: '🎯' },
    { key: 'warningSigns', label: 'Healthy Communication', icon: '💬' },
  ];

  // Get team recommendations based on team score
  const teamRecommendations = getTeamRecommendations(report.teamScore);
  const scoreCategory = getScoreCategory(report.teamScore, 'team');

  // ============================================
  // TAB SYSTEM: Define tab content
  // ============================================
  const tabs: TabItem[] = [
    {
      id: 'recommendations',
      label: 'Team Recommendations',
      content: (
        <div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            color: '#111827', 
            marginBottom: '0.5rem',
            fontWeight: '700'
          }}>
            🎯 Team Recommendations
          </h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.9375rem', 
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            Based on your team's average score of {report.teamScore.toFixed(1)} ({scoreCategory}), 
            here are specific actions your team can take to strengthen trust and collaboration:
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1rem' 
          }}>
            {teamRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                number={rec.id}
                text={rec.text}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'trust-matrix',
      label: 'Trust Matrix',
      content: <TrustMatrix />
    },
    {
      id: 'trust-framework',
      label: 'Trust Framework',
      content: <TrustFramework />
    }
  ];

  return (
    <div className="report-container">
      <div className="report-content">
        {/* Header */}
        <div className="report-header">
          <button onClick={() => navigate(`/admin/assessment/${id}`)} className="btn-back">
            ← Back to Assessment
          </button>
          <h1>Team Report: {teamName}</h1>
          <p className="report-meta">
            Based on {report.participationCount} team member{report.participationCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Score Card */}
        <div className="score-card-large">
          <div className="score-header">
            <h2>Team Health Score</h2>
          </div>
          <div className="score-display">
            <div className={`score-number ${getScoreColor(report.teamScore)}`}>
              {report.teamScore.toFixed(1)}
            </div>
            <div className="score-grade-badge">
              {report.healthGrade}
            </div>
          </div>
          <div className="score-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Base Score:</span>
              <span className="breakdown-value">{report.baseScore.toFixed(1)}</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Consistency Factor:</span>
              <span className="breakdown-value">{report.consistencyFactor.toFixed(2)}x</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Standard Deviation:</span>
              <span className="breakdown-value">{report.standardDeviation.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dimensions Grid */}
        <div className="dimensions-section">
          <h2>Dimension Scores</h2>
          <div className="dimensions-grid">
            {dimensions.map((dim) => {
              const score = report.dimensionScores[dim.key as keyof DimensionScores];
              return (
                <div key={dim.key} className={`dimension-card ${getScoreColor(score)}`}>
                  <div className="dimension-icon">{dim.icon}</div>
                  <div className="dimension-info">
                    <div className="dimension-label">{dim.label}</div>
                    <div className="dimension-score">{score.toFixed(1)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================
            TAB SYSTEM: Recommendations, Matrix, Framework
            ============================================ */}
        <div style={{ 
          background: 'white', 
          borderRadius: '1.5rem', 
          padding: '2.5rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <Tabs tabs={tabs} defaultTab="recommendations" />
        </div>

        {/* Actions */}
        <div className="report-actions">
          <button onClick={() => window.print()} className="btn-secondary">
            🖨️ Print Report
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamReport;