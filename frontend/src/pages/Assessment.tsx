// 完整版问卷页面组件 - 27题 + 雷达图

import { useState } from 'react';
import { QUESTIONS } from '../data/questions';
import { calculateAssessment, type AssessmentResult } from '../service/api';
import RadarChart from '../components/RadarChart';
import './Assessment.css';

interface Responses {
  [key: string]: number;
}

function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const answeredCount = Object.keys(responses).length;

  const handleAnswer = (value: number) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting answers to backend...');
      const assessmentResult = await calculateAssessment(responses);
      console.log('Received backend response:', assessmentResult);

      setResult(assessmentResult);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err.message || 'Submission failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="assessment-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Calculating your assessment results...</h2>
          <p>This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Result display
  if (isSubmitted && result) {
    return (
      <div className="assessment-container">
        <div className="result-card-wide">
          {/* Header */}
          <div className="result-header">
            <h1>🎉 Assessment Complete!</h1>
            <div className="result-summary">
              <div className="summary-item">
                <span className="summary-label">Your Score</span>
                <span className="summary-value score-large">{result.personalScore}</span>
                <span className="summary-badge">{result.grade}</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="radar-section">
            <h2>📊 Dimension Analysis</h2>
            <RadarChart scores={result.dimensionScores} />
          </div>

          {/* Dimension Scores Grid */}
          <div className="dimensions-section-detailed">
            <h2>🎯 Detailed Scores</h2>
            <div className="dimensions-grid-detailed">
              <DimensionCard
                icon="🤝"
                label="Team Connection"
                score={result.dimensionScores.teamConnection}
              />
              <DimensionCard
                icon="🙏"
                label="Appreciation"
                score={result.dimensionScores.appreciation}
              />
              <DimensionCard
                icon="👂"
                label="Responsiveness"
                score={result.dimensionScores.responsiveness}
              />
              <DimensionCard
                icon="✨"
                label="Trust & Positivity"
                score={result.dimensionScores.trustPositivity}
              />
              <DimensionCard
                icon="⚖️"
                label="Conflict Management"
                score={result.dimensionScores.conflictManagement}
              />
              <DimensionCard
                icon="🎯"
                label="Goal Support"
                score={result.dimensionScores.goalSupport}
              />
              <DimensionCard
                icon="💬"
                label="Healthy Communication"
                score={result.dimensionScores.warningSigns}
                highlight
              />
            </div>
          </div>

          {/* Insights Grid */}
          <div className="insights-grid">
            {/* Strengths */}
            <div className="insight-card strengths-card">
              <h3>💪 Your Strengths</h3>
              <ul className="insight-list">
                {result.strengths.map((strength, index) => (
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
                {result.growthAreas.map((area, index) => (
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
            <h3>💡 Action Recommendations</h3>
            <div className="recommendations-grid">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <span className="rec-number">{index + 1}</span>
                  <span className="rec-text">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="result-actions">
            <button onClick={() => window.location.reload()} className="btn-primary btn-large">
              Take Assessment Again
            </button>
            <button onClick={() => window.print()} className="btn-secondary btn-large">
              Print Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error display
  if (error) {
    return (
      <div className="assessment-container">
        <div className="error-card">
          <h2>❌ Submission Failed</h2>
          <p className="error-message">{error}</p>
          <button onClick={() => setError(null)} className="btn-primary">
            Return to Assessment
          </button>
        </div>
      </div>
    );
  }

  // Assessment interface
  return (
    <div className="assessment-container">
      {/* Header */}
      <div className="assessment-header">
        <h1>Team Effectiveness Survey</h1>
        <p>Evaluation based on Gottman Method</p>
      </div>

      {/* Progress */}
      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-info">
          <span className="progress-text">
            Question {currentQuestionIndex + 1} / {QUESTIONS.length}
          </span>
          {/* <span className="answered-count">
            {answeredCount} / {QUESTIONS.length} answered
          </span> */}
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-category">{currentQuestion.category}</div>
        <h2 className="question-text">{currentQuestion.text}</h2>

        {/* Options */}
        <div className="options-container">
          {currentQuestion.scale.map((option) => (
            <button
              key={option.value}
              className={`option-button ${
                responses[currentQuestion.id] === option.value ? 'selected' : ''
              }`}
              onClick={() => handleAnswer(option.value)}
            >
              <div className="option-value">{option.value}</div>
              <div className="option-label">{option.label}</div>
            </button>
          ))}
        </div>

        {currentQuestion.isReversed && (
          <div className="reverse-note">
            ⚠️ Note: This is a reverse-scored question
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="navigation-buttons">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary"
        >
          ← Go Back
        </button>

        <button
          onClick={handleNext}
          disabled={!responses[currentQuestion.id]}
          className="btn-primary"
        >
          {currentQuestionIndex === QUESTIONS.length - 1 ? 'Submit Assessment →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

// Dimension Card Component
interface DimensionCardProps {
  icon: string;
  label: string;
  score: number;
  highlight?: boolean;
}

const DimensionCard = ({ icon, label, score, highlight }: DimensionCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 55) return 'score-fair';
    return 'score-poor';
  };

  return (
    <div className={`dimension-card ${highlight ? 'dimension-highlight' : ''}`}>
      <div className="dimension-icon">{icon}</div>
      <div className="dimension-info">
        <div className="dimension-label-sm">{label}</div>
        <div className={`dimension-score-lg ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default Assessment;