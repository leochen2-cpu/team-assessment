import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PersonalReport.css';

interface DimensionComparison {
  personal: number;
  team: number;
  difference: number;
}

interface PersonalReportData {
  participantName: string;
  participantEmail: string;
  teamName: string;
  submittedAt: string;
  
  personalScore: number;
  personalGrade: string;
  personalDimensions: Record<string, number>;
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
  
  teamScore: number;
  teamGrade: string;
  teamDimensions: Record<string, number>;
  participationCount: number;
  
  comparison: {
    scoreDifference: number;
    dimensionComparison: Record<string, DimensionComparison>;
  };
}

function PersonalReport() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<PersonalReportData | null>(null);

  useEffect(() => {
    fetchPersonalReport();
  }, [code]);

  const fetchPersonalReport = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/participant/${code}/report`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch report');
      }

      const data = await response.json();
      setReport(data.report);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load report');
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    return 'poor';
  };

  const getDifferenceIcon = (diff: number) => {
    if (Math.abs(diff) < 5) return '↔️';
    return diff > 0 ? '↗️' : '↘️';
  };

  const getDifferenceColor = (diff: number) => {
    if (Math.abs(diff) < 5) return 'neutral';
    return diff > 0 ? 'positive' : 'negative';
  };

  if (loading) {
    return (
      <div className="personal-report-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Loading Your Report...</h2>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="personal-report-container">
        <div className="error-card">
          <h2>❌ {error || 'Report not found'}</h2>
          <p>Please check your email for the correct link, or contact your team administrator.</p>
        </div>
      </div>
    );
  }

  const dimensions = [
    { key: 'teamConnection', label: 'Team Connection', icon: '🤝' },
    { key: 'appreciation', label: 'Appreciation', icon: '🙏' },
    { key: 'responsiveness', label: 'Responsiveness', icon: '👂' },
    { key: 'trustPositivity', label: 'Trust & Positivity', icon: '✨' },
    { key: 'conflictManagement', label: 'Conflict Management', icon: '⚖️' },
    { key: 'goalSupport', label: 'Goal Support', icon: '🎯' },
    { key: 'warningSigns', label: 'Healthy Communication', icon: '💬' },
  ];

  return (
    <div className="personal-report-container">
      <div className="report-content">
        {/* Header */}
        <div className="report-header">
          <h1>Your Personal Report</h1>
          <h2>{report.teamName}</h2>
          <p>Hi {report.participantName}! Here's your personalized assessment report.</p>
        </div>

        {/* Score Comparison */}
        <div className="score-comparison-section">
          <h3>📊 Overall Scores</h3>
          <div className="score-cards">
            <div className={`score-card ${getScoreColor(report.personalScore)}`}>
              <div className="score-label">Your Score</div>
              <div className="score-value">{report.personalScore.toFixed(1)}</div>
              <div className="score-grade">{report.personalGrade}</div>
            </div>

            <div className="comparison-indicator">
              <div className={`difference-badge ${getDifferenceColor(report.comparison.scoreDifference)}`}>
                {getDifferenceIcon(report.comparison.scoreDifference)}
                {Math.abs(report.comparison.scoreDifference).toFixed(1)}
              </div>
            </div>

            <div className={`score-card ${getScoreColor(report.teamScore)}`}>
              <div className="score-label">Team Average</div>
              <div className="score-value">{report.teamScore.toFixed(1)}</div>
              <div className="score-grade">{report.teamGrade}</div>
            </div>
          </div>
          <p className="comparison-note">
            Based on {report.participationCount} team member{report.participationCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Dimension Comparison */}
        <div className="dimensions-comparison-section">
          <h3>🎯 Dimension Breakdown</h3>
          <div className="dimensions-grid">
            {dimensions.map((dim) => {
              const comparison = report.comparison.dimensionComparison[dim.key];
              return (
                <div key={dim.key} className="dimension-comparison-card">
                  <div className="dimension-header">
                    <span className="dimension-icon">{dim.icon}</span>
                    <span className="dimension-name">{dim.label}</span>
                  </div>
                  
                  <div className="dimension-bars">
                    <div className="bar-row">
                      <span className="bar-label">You</span>
                      <div className="bar-container">
                        <div 
                          className={`bar-fill personal ${getScoreColor(comparison.personal)}`}
                          style={{ width: `${comparison.personal}%` }}
                        ></div>
                      </div>
                      <span className="bar-value">{comparison.personal.toFixed(1)}</span>
                    </div>

                    <div className="bar-row">
                      <span className="bar-label">Team</span>
                      <div className="bar-container">
                        <div 
                          className={`bar-fill team ${getScoreColor(comparison.team)}`}
                          style={{ width: `${comparison.team}%` }}
                        ></div>
                      </div>
                      <span className="bar-value">{comparison.team.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className={`dimension-difference ${getDifferenceColor(comparison.difference)}`}>
                    {getDifferenceIcon(comparison.difference)} {Math.abs(comparison.difference).toFixed(1)} points
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights Grid */}
        <div className="insights-grid">
          {/* Strengths */}
          <div className="insight-card strengths-card">
            <h3>💪 Your Strengths</h3>
            <ul className="insight-list">
              {report.strengths.map((strength, index) => (
                <li key={index}>
                  <span className="bullet">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Growth Areas */}
          <div className="insight-card growth-card">
            <h3>📈 Growth Opportunities</h3>
            <ul className="insight-list">
              {report.growthAreas.map((area, index) => (
                <li key={index}>
                  <span className="bullet">→</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-section">
          <h3>💡 Personalized Action Recommendations</h3>
          <div className="recommendations-grid">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <span className="rec-number">{index + 1}</span>
                <span className="rec-text">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <button onClick={() => window.print()} className="btn-print">
            🖨️ Print Report
          </button>
          <p className="footer-note">
            Questions? Contact your team administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PersonalReport;
