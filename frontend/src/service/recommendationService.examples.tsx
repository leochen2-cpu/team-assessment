/**
 * USAGE EXAMPLES - recommendationService.ts
 * 
 * This file shows how to use the recommendation service in your React components
 */

import {
  getIndividualRecommendations,
  getTeamRecommendations,
  getScoreCategory,
  getScoreGapInsight,
  getTrustMatrix,
  getTrustFramework,
  getRiskLevelColor,
  getGapCategoryColor,
  calculateGapSize,
} from '../service/recommendationService';

// ============================================
// Example 1: Get Individual Recommendations
// ============================================

function ExamplePersonalReport() {
  const individualScore = 85; // Example score
  
  // Get recommendations for this score
  const recommendations = getIndividualRecommendations(individualScore);
  const category = getScoreCategory(individualScore, 'individual');
  
  console.log(`Score: ${individualScore}`);
  console.log(`Category: ${category}`); // "Solid Foundation"
  console.log(`Recommendations count: ${recommendations.length}`); // 4
  
  // Use in JSX
  return (
    <div>
      <h2>Your Score: {individualScore} - {category}</h2>
      <div className="recommendations">
        {recommendations.map((rec) => (
          <div key={rec.id} className="recommendation-card">
            <span className="number">{rec.id}</span>
            <p>{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 2: Get Team Recommendations
// ============================================

function ExampleTeamReport() {
  const teamAverageScore = 92; // Example team average
  
  // Get recommendations for this score
  const recommendations = getTeamRecommendations(teamAverageScore);
  const category = getScoreCategory(teamAverageScore, 'team');
  
  console.log(`Team Average: ${teamAverageScore}`);
  console.log(`Category: ${category}`); // "Thriving Team"
  console.log(`Recommendations count: ${recommendations.length}`); // 4
  
  return (
    <div>
      <h2>Team Average: {teamAverageScore} - {category}</h2>
      <div className="recommendations">
        {recommendations.map((rec) => (
          <div key={rec.id} className="recommendation-card">
            <span className="number">{rec.id}</span>
            <p>{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 3: Get Score Gap Insight
// ============================================

function ExampleScoreGapAnalysis() {
  const individualScore = 95;
  const teamScore = 60;
  
  // Get gap insight
  const gapInsight = getScoreGapInsight(individualScore, teamScore);
  
  if (!gapInsight) {
    return <div>No gap insight available</div>;
  }
  
  // Calculate additional info
  const gapSize = calculateGapSize(individualScore, teamScore);
  const riskColor = getRiskLevelColor(gapInsight.riskLevel);
  const categoryColor = getGapCategoryColor(gapInsight.gapCategory);
  
  console.log('Gap Insight:', {
    category: gapInsight.gapCategory,
    gapSize: gapSize,
    riskLevel: gapInsight.riskLevel,
  });
  
  return (
    <div>
      <h2>Your Perception vs Team Reality</h2>
      <p>Your Score: {individualScore} | Team Average: {teamScore}</p>
      <p>Gap: {gapSize} points</p>
      
      <div className={`gap-category ${categoryColor} border-l-4 p-4 rounded`}>
        <h3>{gapInsight.gapCategory}</h3>
        <span className={`risk-badge ${riskColor} px-3 py-1 rounded-full text-sm`}>
          Risk: {gapInsight.riskLevel}
        </span>
      </div>
      
      <div className="gap-details mt-4">
        <section>
          <h4>What This Gap Means</h4>
          <p>{gapInsight.gapMeaning}</p>
        </section>
        
        <section>
          <h4>Primary Causes</h4>
          <p>{gapInsight.primaryCauses}</p>
        </section>
        
        <section>
          <h4>Key Questions to Explore</h4>
          <p>{gapInsight.keyQuestions}</p>
        </section>
        
        <section>
          <h4>Immediate Recommendations</h4>
          <p>{gapInsight.recommendations}</p>
        </section>
      </div>
    </div>
  );
}

// ============================================
// Example 4: Display Trust Matrix
// ============================================

function ExampleTrustMatrix() {
  const matrix = getTrustMatrix();
  
  console.log('Trust Matrix:', matrix.title);
  console.log('Content rows:', matrix.content.length); // 14 rows
  
  return (
    <div>
      <h2>{matrix.title}</h2>
      <p>{matrix.description}</p>
      
      <table className="trust-matrix-table w-full border-collapse">
        <tbody>
          {matrix.content.map((row, index) => (
            <tr key={index} className="border-b">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-2 border-r">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Example 5: Display Trust Framework
// ============================================

function ExampleTrustFramework() {
  const framework = getTrustFramework();
  
  console.log('Trust Framework:', framework.title);
  console.log('Content rows:', framework.content.length); // 15 rows
  
  return (
    <div>
      <h2>{framework.title}</h2>
      <p>{framework.description}</p>
      
      <table className="trust-framework-table w-full border-collapse">
        <tbody>
          {framework.content.map((row, index) => (
            <tr key={index} className={index === 0 ? 'bg-blue-100 font-bold' : 'border-b'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-3 border-r">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Example 6: Complete Personal Report
// ============================================

function CompletePersonalReportExample() {
  const individualScore = 88;
  const teamScore = 78;
  
  // Get all data
  const individualRecs = getIndividualRecommendations(individualScore);
  const individualCategory = getScoreCategory(individualScore, 'individual');
  const gapInsight = getScoreGapInsight(individualScore, teamScore);
  
  return (
    <div className="personal-report">
      {/* Section 1: Score Overview (existing content) */}
      <section className="score-overview">
        <h1>Your Personal Report</h1>
        <p>Score: {individualScore} - {individualCategory}</p>
        {/* ... existing radar chart, etc. */}
      </section>
      
      {/* Section 2: NEW - Personalized Recommendations */}
      <section className="personalized-recommendations mt-8">
        <h2 className="text-2xl font-bold mb-4">Personalized Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {individualRecs.map((rec) => (
            <div key={rec.id} className="recommendation-card bg-white p-4 rounded-lg shadow">
              <div className="flex items-start">
                <span className="recommendation-number bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  {rec.id}
                </span>
                <p className="text-gray-700">{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Section 3: NEW - Score Gap Analysis */}
      <section className="score-gap-analysis mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Perception vs Team Reality</h2>
        {gapInsight && (
          <div className={`gap-insight ${getGapCategoryColor(gapInsight.gapCategory)} border-l-4 p-6 rounded-lg`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{gapInsight.gapCategory}</h3>
              <span className={`${getRiskLevelColor(gapInsight.riskLevel)} px-3 py-1 rounded-full text-sm font-medium border`}>
                {gapInsight.riskLevel} Risk
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What This Gap Means</h4>
                <p className="text-gray-700">{gapInsight.gapMeaning}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Primary Causes</h4>
                <p className="text-gray-700">{gapInsight.primaryCauses}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Key Questions to Explore</h4>
                <p className="text-gray-700">{gapInsight.keyQuestions}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Immediate Recommendations</h4>
                <p className="text-gray-700">{gapInsight.recommendations}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================
// Example 7: Complete Team Report
// ============================================

function CompleteTeamReportExample() {
  const teamScore = 85;
  
  // Get all data
  const teamRecs = getTeamRecommendations(teamScore);
  const teamCategory = getScoreCategory(teamScore, 'team');
  const matrix = getTrustMatrix();
  const framework = getTrustFramework();
  
  return (
    <div className="team-report">
      {/* Section 1: Team Overview (existing content) */}
      <section className="team-overview">
        <h1>Team Report</h1>
        <p>Team Average: {teamScore} - {teamCategory}</p>
        {/* ... existing radar chart, comparison table, etc. */}
      </section>
      
      {/* Section 2: NEW - Team Recommendations */}
      <section className="team-recommendations mt-8">
        <h2 className="text-2xl font-bold mb-4">Team Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamRecs.map((rec) => (
            <div key={rec.id} className="recommendation-card bg-white p-4 rounded-lg shadow">
              <div className="flex items-start">
                <span className="recommendation-number bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  {rec.id}
                </span>
                <p className="text-gray-700">{rec.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Section 3: NEW - Trust Matrix */}
      <section className="trust-matrix mt-8">
        <h2 className="text-2xl font-bold mb-4">{matrix.title}</h2>
        <p className="text-gray-600 mb-4">{matrix.description}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <tbody>
              {matrix.content.map((row, index) => (
                <tr key={index} className={index === 0 ? 'bg-blue-100 font-semibold' : ''}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* Section 4: NEW - Trust Framework */}
      <section className="trust-framework mt-8">
        <h2 className="text-2xl font-bold mb-4">{framework.title}</h2>
        <p className="text-gray-600 mb-4">{framework.description}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <tbody>
              {framework.content.map((row, index) => (
                <tr key={index} className={index === 0 || index === 1 ? 'bg-gray-100 font-semibold' : ''}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export {
  ExamplePersonalReport,
  ExampleTeamReport,
  ExampleScoreGapAnalysis,
  ExampleTrustMatrix,
  ExampleTrustFramework,
  CompletePersonalReportExample,
  CompleteTeamReportExample,
};
