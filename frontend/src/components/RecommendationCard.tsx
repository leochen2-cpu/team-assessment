/**
 * RecommendationCard Component
 * 
 * Displays a single recommendation in a clean card format with numbering.
 * Used in both Personal and Team reports.
 */

import React from 'react';

interface RecommendationCardProps {
  /** Recommendation number (e.g., 1, 2, 3, 4) */
  number: number | string;
  
  /** Recommendation text content */
  text: string;
  
  /** Optional category label (e.g., "Thriving Team", "Solid Foundation") */
  category?: string;
  
  /** Optional custom className for additional styling */
  className?: string;
}

/**
 * RecommendationCard - Clean, simple card component for displaying recommendations
 * 
 * @example
 * <RecommendationCard
 *   number={1}
 *   text="Continue building trust through small daily actions..."
 * />
 */
const RecommendationCard: React.FC<RecommendationCardProps> = ({
  number,
  text,
  category,
  className = '',
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Number Badge - Simple circle with number */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            {number}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {category && (
            <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
              {category}
            </div>
          )}
          <p className="text-gray-700 leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
