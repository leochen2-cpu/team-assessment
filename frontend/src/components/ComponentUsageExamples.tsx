/**
 * COMPONENT USAGE EXAMPLES
 * 
 * This file shows how to use the 4 new components in your report pages.
 * Copy these examples into PersonalReport.tsx and TeamReport.tsx
 */

import React from 'react';
import RecommendationCard from '../components/RecommendationCard';
import ScoreGapAnalysis from '../components/ScoreGapAnalysis';
import TrustMatrix from '../components/TrustMatrix';
import TrustFramework from '../components/TrustFramework';
import {
  getIndividualRecommendations,
  getTeamRecommendations,
  getScoreCategory,
  getScoreGapInsight,
} from '../service/recommendationService';

// ============================================
// Example 1: Personal Report with New Components
// ============================================

function PersonalReportExample() {
  // Example data - in real code, get these from your API/state
  const individualScore = 85;
  const teamScore = 78;
  
  // Get recommendations and insights
  const recommendations = getIndividualRecommendations(individualScore);
  const category = getScoreCategory(individualScore, 'individual');
  const gapInsight = getScoreGapInsight(individualScore, teamScore);
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Your existing content: Header, radar chart, etc. */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Personal Report</h1>
        <p>Your Score: {individualScore} - {category}</p>
        {/* ... existing radar chart ... */}
      </section>
      
      {/* NEW SECTION 1: Personalized Recommendations */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Personalized Recommendations
        </h2>
        <p className="text-gray-600 mb-6">
          Based on your score of {individualScore}, here are specific actions you can take:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              number={rec.id}
              text={rec.text}
            />
          ))}
        </div>
      </section>
      
      {/* NEW SECTION 2: Score Gap Analysis */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your Perception vs Team Reality
        </h2>
        <p className="text-gray-600 mb-6">
          Understanding the gap between your experience and the team average can provide important insights.
        </p>
        
        {gapInsight && (
          <ScoreGapAnalysis
            insight={gapInsight}
            individualScore={individualScore}
            teamScore={teamScore}
          />
        )}
      </section>
    </div>
  );
}

// ============================================
// Example 2: Team Report with New Components
// ============================================

function TeamReportExample() {
  // Example data - in real code, get these from your API/state
  const teamScore = 82;
  
  // Get recommendations
  const recommendations = getTeamRecommendations(teamScore);
  const category = getScoreCategory(teamScore, 'team');
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Your existing content: Header, radar chart, comparison table, etc. */}
      <section>
        <h1 className="text-3xl font-bold mb-4">Team Report</h1>
        <p>Team Average: {teamScore} - {category}</p>
        {/* ... existing radar chart, comparison table ... */}
      </section>
      
      {/* NEW SECTION 1: Team Recommendations */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Team Recommendations
        </h2>
        <p className="text-gray-600 mb-6">
          Based on your team's average score of {teamScore}, here are specific actions your team can take:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              number={rec.id}
              text={rec.text}
            />
          ))}
        </div>
      </section>
      
      {/* NEW SECTION 2: Trust Matrix (Fixed Content) */}
      <section>
        <TrustMatrix />
      </section>
      
      {/* NEW SECTION 3: Trust Framework (Fixed Content) */}
      <section>
        <TrustFramework />
      </section>
    </div>
  );
}

// ============================================
// Example 3: Using RecommendationCard with Category
// ============================================

function RecommendationCardWithCategoryExample() {
  return (
    <RecommendationCard
      number={1}
      text="Continue building trust through small daily actions: Keep acknowledging teammates' contributions..."
      category="Thriving Team"
      className="mb-4"
    />
  );
}

// ============================================
// Example 4: Handling Missing Gap Insight
// ============================================

function SafeGapAnalysisExample() {
  const individualScore = 85;
  const teamScore = 78;
  const gapInsight = getScoreGapInsight(individualScore, teamScore);
  
  return (
    <div>
      {gapInsight ? (
        <ScoreGapAnalysis
          insight={gapInsight}
          individualScore={individualScore}
          teamScore={teamScore}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Gap analysis not available for this score combination.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 5: Responsive Grid Layout
// ============================================

function ResponsiveRecommendationsExample() {
  const recommendations = getIndividualRecommendations(85);
  
  return (
    <div>
      {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            number={rec.id}
            text={rec.text}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 6: Complete Personal Report Structure
// ============================================

function CompletePersonalReportStructure() {
  const individualScore = 88;
  const teamScore = 75;
  const recommendations = getIndividualRecommendations(individualScore);
  const category = getScoreCategory(individualScore, 'individual');
  const gapInsight = getScoreGapInsight(individualScore, teamScore);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Personal Assessment Report
          </h1>
          <p className="text-gray-600">
            Your Score: {individualScore} • Category: {category}
          </p>
        </div>
        
        {/* Section 1: Existing - Score Overview */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Score Overview</h2>
          {/* Your existing radar chart component */}
          <div className="placeholder">Radar Chart Here</div>
        </section>
        
        {/* Section 2: NEW - Personalized Recommendations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Personalized Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                number={rec.id}
                text={rec.text}
              />
            ))}
          </div>
        </section>
        
        {/* Section 3: NEW - Gap Analysis */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Perception vs Team Reality
          </h2>
          {gapInsight && (
            <ScoreGapAnalysis
              insight={gapInsight}
              individualScore={individualScore}
              teamScore={teamScore}
            />
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================
// Example 7: Complete Team Report Structure
// ============================================

function CompleteTeamReportStructure() {
  const teamScore = 85;
  const recommendations = getTeamRecommendations(teamScore);
  const category = getScoreCategory(teamScore, 'team');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Team Assessment Report
          </h1>
          <p className="text-gray-600">
            Team Average: {teamScore} • Category: {category}
          </p>
        </div>
        
        {/* Section 1: Existing - Team Overview */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Team Performance Overview</h2>
          {/* Your existing radar chart and comparison table */}
          <div className="placeholder">Radar Chart & Comparison Table Here</div>
        </section>
        
        {/* Section 2: NEW - Team Recommendations */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Team Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                number={rec.id}
                text={rec.text}
              />
            ))}
          </div>
        </section>
        
        {/* Section 3: NEW - Trust Matrix */}
        <section className="mb-8">
          <TrustMatrix />
        </section>
        
        {/* Section 4: NEW - Trust Framework */}
        <section className="mb-8">
          <TrustFramework />
        </section>
      </div>
    </div>
  );
}

// ============================================
// Example 8: Print-Friendly Layout
// ============================================

function PrintFriendlyExample() {
  const recommendations = getIndividualRecommendations(85);
  
  return (
    <div className="print:bg-white">
      {/* Add print-specific classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            number={rec.id}
            text={rec.text}
            className="print:mb-4 print:shadow-none"
          />
        ))}
      </div>
    </div>
  );
}

export {
  PersonalReportExample,
  TeamReportExample,
  RecommendationCardWithCategoryExample,
  SafeGapAnalysisExample,
  ResponsiveRecommendationsExample,
  CompletePersonalReportStructure,
  CompleteTeamReportStructure,
  PrintFriendlyExample,
};
