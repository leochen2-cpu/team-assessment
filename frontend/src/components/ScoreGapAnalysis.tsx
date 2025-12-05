/**
 * ScoreGapAnalysis Component
 * 
 * Displays comprehensive analysis of the gap between individual perception
 * and team reality, including risk level, causes, and recommendations.
 */

import React from 'react';
import type { ScoreGapInsight } from '../service/recommendationService';
import { getRiskLevelColor, getGapCategoryColor } from '../service/recommendationService';

interface ScoreGapAnalysisProps {
  /** Score gap insight data */
  insight: ScoreGapInsight;
  
  /** Individual's score */
  individualScore: number;
  
  /** Team average score */
  teamScore: number;
  
  /** Optional custom className */
  className?: string;
}

/**
 * ScoreGapAnalysis - Comprehensive gap analysis panel
 * 
 * @example
 * <ScoreGapAnalysis
 *   insight={gapInsight}
 *   individualScore={95}
 *   teamScore={60}
 * />
 */
const ScoreGapAnalysis: React.FC<ScoreGapAnalysisProps> = ({
  insight,
  individualScore,
  teamScore,
  className = '',
}) => {
  const gapSize = Math.abs(individualScore - teamScore);
  const riskColor = getRiskLevelColor(insight.riskLevel);
  const categoryBorderColor = getGapCategoryColor(insight.gapCategory);
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${categoryBorderColor} p-6 ${className}`}>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {insight.gapCategory}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Your Score: <strong>{individualScore}</strong></span>
              <span>•</span>
              <span>Team Average: <strong>{teamScore}</strong></span>
              <span>•</span>
              <span>Gap: <strong>{gapSize} points</strong></span>
            </div>
          </div>
          
          {/* Risk Level Badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${riskColor}`}>
              {insight.riskLevel} Risk
            </span>
          </div>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="space-y-5">
        {/* What This Gap Means */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            What This Gap Means
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {insight.gapMeaning}
          </p>
        </section>
        
        {/* Primary Causes */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Primary Causes
          </h4>
          <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {insight.primaryCauses}
            </p>
          </div>
        </section>
        
        {/* Key Questions to Explore */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Key Questions to Explore
          </h4>
          <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
            <p className="text-gray-700 leading-relaxed italic">
              {insight.keyQuestions}
            </p>
          </div>
        </section>
        
        {/* Immediate Recommendations */}
        <section>
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
            Immediate Recommendations
          </h4>
          <div className="bg-green-50 rounded-md p-3 border border-green-200">
            <p className="text-gray-700 leading-relaxed">
              {insight.recommendations}
            </p>
          </div>
        </section>
      </div>
      
      {/* Footer Note for Critical/Emergency cases */}
      {(insight.riskLevel === 'Critical' || insight.riskLevel === 'Emergency') && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 font-medium">
              This gap requires immediate attention and may benefit from external support (HR, manager, or professional mediator).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreGapAnalysis;
