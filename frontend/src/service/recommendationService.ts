/**
 * Recommendation Service
 * 
 * Provides functions to retrieve personalized recommendations, score gap insights,
 * and trust framework content based on team assessment scores.
 */

import recommendationsData from '../data/recommendations-data.json';

// ========================
// TypeScript Interfaces
// ========================

/**
 * Single recommendation item
 */
export interface RecommendationItem {
  id: number | string;
  text: string;
}

/**
 * Group of recommendations for a specific score range
 */
export interface RecommendationGroup {
  category: string;
  recommendations: RecommendationItem[];
}

/**
 * Score gap analysis insight
 */
export interface ScoreGapInsight {
  individualRange: string;
  teamRange: string;
  gapSize: string;
  gapCategory: string;
  gapMeaning: string;
  primaryCauses: string;
  keyQuestions: string;
  recommendations: string;
  riskLevel: string;
}

/**
 * Trust Matrix content (fixed content for all team reports)
 */
export interface TrustMatrixContent {
  title: string;
  description: string;
  content: string[][];
}

/**
 * Trust Framework content (fixed content for all team reports)
 */
export interface TrustFrameworkContent {
  title: string;
  description: string;
  content: string[][];
}

// ========================
// Helper Functions
// ========================

/**
 * Maps a numeric score to its corresponding score range string
 * 
 * @param score - The numeric score (0-100)
 * @returns Score range string (e.g., "75-90", "90-100")
 * 
 * @example
 * getScoreRange(85) // returns "75-90"
 * getScoreRange(95) // returns "90-100"
 * getScoreRange(60) // returns "50-75"
 */
export function getScoreRange(score: number): string {
  if (score >= 90) return '90-100';
  if (score >= 75) return '75-90';
  if (score >= 50) return '50-75';
  return '0-50';
}

/**
 * Gets the Tailwind CSS color class for a risk level badge
 * 
 * @param riskLevel - The risk level string (e.g., "Low", "Critical", "Emergency")
 * @returns Tailwind CSS color classes for background and text
 * 
 * @example
 * getRiskLevelColor("Critical") // returns "bg-red-100 text-red-800"
 */
export function getRiskLevelColor(riskLevel: string): string {
  const level = riskLevel.toLowerCase();
  
  if (level === 'low') {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (level === 'moderate' || level === 'moderate-high') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  if (level === 'high' || level === 'critical') {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (level === 'emergency') {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  
  // Default
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Gets a color class for the gap category
 * 
 * @param gapCategory - The gap category string
 * @returns Tailwind CSS color class
 */
export function getGapCategoryColor(gapCategory: string): string {
  const category = gapCategory.toLowerCase();
  
  if (category.includes('critical') || category.includes('emergency')) {
    return 'border-red-500 bg-red-50';
  }
  if (category.includes('significant') || category.includes('struggling')) {
    return 'border-orange-500 bg-orange-50';
  }
  if (category.includes('moderate') || category.includes('disconnect')) {
    return 'border-yellow-500 bg-yellow-50';
  }
  if (category.includes('shared') || category.includes('alignment')) {
    return 'border-blue-500 bg-blue-50';
  }
  
  // Default
  return 'border-gray-500 bg-gray-50';
}

// ========================
// Main Service Functions
// ========================

/**
 * Gets individual recommendations based on personal score
 * 
 * @param score - Individual score (0-100)
 * @returns Array of 4-6 recommendation items
 * 
 * @example
 * const recs = getIndividualRecommendations(85);
 * // Returns 4 recommendations for the "75-90" range
 */
export function getIndividualRecommendations(score: number): RecommendationItem[] {
  const range = getScoreRange(score);
  const data = recommendationsData.recommendations.individual[range as keyof typeof recommendationsData.recommendations.individual];
  
  if (!data) {
    console.warn(`No individual recommendations found for score range: ${range}`);
    return [];
  }
  
  return data.recommendations;
}

/**
 * Gets team recommendations based on team average score
 * 
 * @param score - Team average score (0-100)
 * @returns Array of 4-6 recommendation items
 * 
 * @example
 * const recs = getTeamRecommendations(92);
 * // Returns 4 recommendations for the "90-100" range
 */
export function getTeamRecommendations(score: number): RecommendationItem[] {
  const range = getScoreRange(score);
  const data = recommendationsData.recommendations.team[range as keyof typeof recommendationsData.recommendations.team];
  
  if (!data) {
    console.warn(`No team recommendations found for score range: ${range}`);
    return [];
  }
  
  return data.recommendations;
}

/**
 * Gets the category label for a score range
 * 
 * @param score - The score to get category for
 * @param type - 'individual' or 'team'
 * @returns Category string (e.g., "Thriving Team", "Solid Foundation")
 */
export function getScoreCategory(score: number, type: 'individual' | 'team'): string {
  const range = getScoreRange(score);
  const data = recommendationsData.recommendations[type][range as keyof typeof recommendationsData.recommendations.individual];
  
  if (!data) {
    return 'Unknown';
  }
  
  return data.category;
}

/**
 * Gets score gap insight based on individual and team scores
 * 
 * This function finds the appropriate gap analysis from 12 predefined scenarios
 * based on the difference between individual perception and team reality.
 * 
 * @param individualScore - Individual's score (0-100)
 * @param teamScore - Team average score (0-100)
 * @returns Score gap insight object, or null if no matching scenario found
 * 
 * @example
 * const insight = getScoreGapInsight(95, 55);
 * // Returns insight for "90-100" individual and "50-75" team (Significant Disconnect)
 */
export function getScoreGapInsight(
  individualScore: number,
  teamScore: number
): ScoreGapInsight | null {
  const individualRange = getScoreRange(individualScore);
  const teamRange = getScoreRange(teamScore);
  
  // Find matching gap scenario
  const gapInsight = recommendationsData.scoreGaps.find(
    (gap) => gap.individualRange === individualRange && gap.teamRange === teamRange
  );
  
  if (!gapInsight) {
    console.warn(
      `No gap insight found for individual range: ${individualRange}, team range: ${teamRange}`
    );
    return null;
  }
  
  return gapInsight;
}

/**
 * Gets all score gap scenarios (useful for testing/debugging)
 * 
 * @returns Array of all 12 gap scenarios
 */
export function getAllScoreGapScenarios(): ScoreGapInsight[] {
  return recommendationsData.scoreGaps;
}

/**
 * Gets the Trust Matrix content (fixed content for all team reports)
 * 
 * This is a 2x2 matrix showing:
 * - Thriving Team 🌿
 * - Solid Foundation 🧱
 * - Trust Erosion 🌧️
 * - Gridlock 🔒
 * 
 * @returns Trust Matrix content object
 */
export function getTrustMatrix(): TrustMatrixContent {
  return recommendationsData.trustMatrix;
}

/**
 * Gets the Trust Framework 3.0 content (fixed content for all team reports)
 * 
 * This provides detailed framework elements across different trust levels:
 * - Emotional Bank Account
 * - Bids for Connection
 * - Emotion Coaching
 * - Mind Map
 * - How to Build Trust
 * 
 * @returns Trust Framework content object
 */
export function getTrustFramework(): TrustFrameworkContent {
  return recommendationsData.trustFramework;
}

// ========================
// Utility Functions
// ========================

/**
 * Calculates the gap size between individual and team scores
 * 
 * @param individualScore - Individual score
 * @param teamScore - Team score
 * @returns Gap size as a number (absolute value)
 */
export function calculateGapSize(individualScore: number, teamScore: number): number {
  return Math.abs(individualScore - teamScore);
}

/**
 * Determines if a gap is "inverted" (individual lower than team)
 * 
 * @param individualScore - Individual score
 * @param teamScore - Team score
 * @returns True if individual score is lower than team score
 */
export function isInvertedGap(individualScore: number, teamScore: number): boolean {
  return individualScore < teamScore;
}

/**
 * Gets a human-readable description of the gap size
 * 
 * @param gapSize - The numeric gap size
 * @returns Human-readable string (e.g., "0-24 points", "25+ points")
 */
export function getGapSizeDescription(gapSize: number): string {
  if (gapSize >= 40) return '40+ points';
  if (gapSize >= 25) return '25-40 points';
  if (gapSize >= 15) return '15-24 points';
  return '0-24 points';
}

// ========================
// Export all for convenience
// ========================

export default {
  // Main functions
  getIndividualRecommendations,
  getTeamRecommendations,
  getScoreCategory,
  getScoreGapInsight,
  getAllScoreGapScenarios,
  getTrustMatrix,
  getTrustFramework,
  
  // Helper functions
  getScoreRange,
  getRiskLevelColor,
  getGapCategoryColor,
  calculateGapSize,
  isInvertedGap,
  getGapSizeDescription,
};
