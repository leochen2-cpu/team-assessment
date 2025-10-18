import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { QUESTIONS } from '../data/questions';
import './SurveyQuestions.css';

interface LocationState {
  code: string;
  name: string;
  email: string;
}

interface Responses {
  [key: string]: number;
}

function SurveyQuestions() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 如果没有state（直接访问这个URL），跳回code输入页
  useEffect(() => {
    if (!state || !state.code || !state.name || !state.email) {
      navigate('/survey');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  const handleAnswer = (value: number) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value,
    });
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/assessments/${code}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantName: state.name,
          participantEmail: state.email,
          responses: responses,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assessment');
      }

      // 提交成功，跳转到成功页面
      navigate(`/survey/${code}/success`, {
        state: {
          name: state.name,
          email: state.email,
        },
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="survey-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h2>Submitting your assessment...</h2>
          <p>Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-container">
      {/* Header */}
      <div className="survey-header">
        <h1>Team Assessment Survey</h1>
        <p>Based on the Gottman Method</p>
      </div>

      {/* Progress */}
      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-info">
          <span className="progress-text">
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </span>
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
            ⚠️ Note: This question is reverse-scored
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="navigation-buttons">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="btn-back-nav"
        >
          ← Back
        </button>

        <button
          onClick={handleNext}
          disabled={!responses[currentQuestion.id]}
          className="btn-next-nav"
        >
          {isLastQuestion ? 'Submit Assessment →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

export default SurveyQuestions;
