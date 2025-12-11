/**
 * TeamReport.tsx (Enhanced with Personalization)
 * 
 * 这是修改后的 TeamReport 页面，整合了所有个性化组件
 * 
 * 使用说明：
 * 1. 替换现有的 frontend/src/pages/TeamReport.tsx
 * 2. 确保所有新组件都已导入
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TeamReport.css';
import RecommendationCard from '../components/RecommendationCard';
import TrustMatrix from '../components/TrustMatrix';  // 使用增强版
import TrustFramework from '../components/TrustFramework';  // 使用增强版
import TeamPosition from '../components/TeamPosition';  // 🆕 新组件
import PriorityAreas from '../components/PriorityAreas';  // 🆕 新组件
import Tabs, { TabItem } from '../components/Tabs';
import {
  getTeamRecommendations,
  getScoreCategory,
} from '../service/recommendationService';

// ============================================
// 类型定义
// ============================================

interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
  warningSigns: number;
}

// 🆕 个性化数据类型
interface TeamPositionData {
  quadrant: 'THRIVING_TEAM' | 'SOLID_FOUNDATION' | 'TRUST_EROSION' | 'GRIDLOCK';
  ebaScore: number;
  bidsScore: number;
  interpretation: string;
  nextStep: string;
}

interface PriorityArea {
  dimension: string;
  displayName: string;
  score: number;
  rank: number;
  currentIssue: string;
  recommendedAction: string;
  frameworkElement: string;
}

interface PersonalizedRecommendations {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  maintenanceActions: string[];
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
  // 🆕 新字段
  teamPosition?: TeamPositionData;
  priorityAreas?: PriorityArea[];
  personalizedRecommendations?: PersonalizedRecommendations;
}

// ============================================
// 主组件
// ============================================

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
      // 获取 assessment 信息
      const assessmentRes = await fetch(`http://localhost:3001/api/admin/assessments/${id}`);
      const assessmentData = await assessmentRes.json();
      
      if (!assessmentData.success) {
        throw new Error('Failed to fetch assessment');
      }

      setTeamName(assessmentData.assessment.teamName);

      // 检查是否已有报告
      if (assessmentData.assessment.teamReport) {
        const teamReportData = assessmentData.assessment.teamReport;
        
        setReport({
          ...teamReportData,
          dimensionScores: JSON.parse(teamReportData.dimensionScores),
          // 🆕 解析个性化数据
          teamPosition: teamReportData.teamPosition ? JSON.parse(teamReportData.teamPosition) : undefined,
          priorityAreas: teamReportData.priorityAreas ? JSON.parse(teamReportData.priorityAreas) : undefined,
          personalizedRecommendations: teamReportData.personalizedRecommendations ? JSON.parse(teamReportData.personalizedRecommendations) : undefined,
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
  // 🆕 准备个性化组件的数据
  // ============================================
  
  // 将priorityAreas转换为TrustFramework需要的格式
  const priorityElementsForFramework = report.priorityAreas
    ? report.priorityAreas.map(area => ({
        dimension: area.dimension,
        frameworkElement: area.frameworkElement,
        rank: area.rank
      }))
    : [];

  // ============================================
  // TAB SYSTEM: Define tab content
  // ============================================
  const tabs: TabItem[] = [
    // 🆕 Tab 1: Overview (新增 - 包含TeamPosition和PriorityAreas)
    {
      id: 'overview',
      label: '📊 Overview',
      content: (
        <div className="space-y-6">
          {/* 🆕 Team Position */}
          {report.teamPosition && (
            <TeamPosition position={report.teamPosition} />
          )}
          
          {/* 🆕 Priority Areas */}
          {report.priorityAreas && report.priorityAreas.length > 0 && (
            <PriorityAreas 
              areas={report.priorityAreas}
              onFrameworkClick={(element) => {
                // 切换到Trust Framework tab
                // 这需要tab系统支持，或者简单地滚动到对应位置
                console.log('Navigate to framework element:', element);
              }}
            />
          )}
        </div>
      )
    },
    
    // Tab 2: Recommendations
    {
      id: 'recommendations',
      label: '💡 Recommendations',
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
          
          {/* 🆕 显示个性化推荐（如果有） */}
          {report.personalizedRecommendations && (
            <div className="mt-8 space-y-6">
              {/* Immediate Actions */}
              {report.personalizedRecommendations.immediate.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-red-900 mb-3">
                    🚨 Immediate Actions (This Week)
                  </h3>
                  <ul className="space-y-2">
                    {report.personalizedRecommendations.immediate.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Short-term Goals */}
              {report.personalizedRecommendations.shortTerm.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-yellow-900 mb-3">
                    📅 Short-term Goals (1-2 Weeks)
                  </h3>
                  <ul className="space-y-2">
                    {report.personalizedRecommendations.shortTerm.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Long-term Goals */}
              {report.personalizedRecommendations.longTerm.length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">
                    🎯 Long-term Goals (1-3 Months)
                  </h3>
                  <ul className="space-y-2">
                    {report.personalizedRecommendations.longTerm.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Maintenance Actions (for high-performing teams) */}
              {report.personalizedRecommendations.maintenanceActions.length > 0 && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-green-900 mb-3">
                    ✅ Maintenance Actions
                  </h3>
                  <ul className="space-y-2">
                    {report.personalizedRecommendations.maintenanceActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="flex-shrink-0 mt-0.5">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    
    // 🆕 Tab 3: Trust Matrix (增强版 - 带高亮)
    {
      id: 'trust-matrix',
      label: '🗺️ Trust Matrix',
      content: (
        <TrustMatrix 
          currentQuadrant={report.teamPosition?.quadrant}
        />
      )
    },
    
    // 🆕 Tab 4: Trust Framework (增强版 - 带智能折叠)
    {
      id: 'trust-framework',
      label: '📚 Trust Framework',
      content: (
        <TrustFramework 
          priorityElements={priorityElementsForFramework}
        />
      )
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
            TAB SYSTEM: Overview, Recommendations, Matrix, Framework
            ============================================ */}
        <div style={{ 
          background: 'white', 
          borderRadius: '1.5rem', 
          padding: '2.5rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <Tabs tabs={tabs} defaultTab="overview" />
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