/**
 * TrustFramework Component
 * 
 * Displays the Team Trust Framework 3.0 with detailed guidance across
 * different trust levels:
 * - Thriving Team 🌿
 * - Solid Foundation 🧱
 * - Trust Erosion 🌧️
 * - Gridlock 🔒
 * 
 * This is FIXED CONTENT displayed on all team reports.
 */

import React, { useEffect, useState } from 'react';
import { getTrustFramework } from '../service/recommendationService';
import type { TrustFrameworkContent } from '../service/recommendationService';

interface TrustFrameworkProps {
  /** Optional custom className */
  className?: string;
}

/**
 * TrustFramework - Displays the Trust Framework 3.0 as a comprehensive table
 * 
 * @example
 * <TrustFramework />
 */
const TrustFramework: React.FC<TrustFrameworkProps> = ({ className = '' }) => {
  const [frameworkData, setFrameworkData] = useState<TrustFrameworkContent | null>(null);
  
  useEffect(() => {
    const data = getTrustFramework();
    setFrameworkData(data);
  }, []);
  
  if (!frameworkData) {
    return <div>Loading Trust Framework...</div>;
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {frameworkData.title}
        </h2>
        <p className="text-gray-600">
          {frameworkData.description}
        </p>
      </div>
      
      {/* Framework Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <tbody>
            {frameworkData.content.map((row, rowIndex) => {
              // Identify special rows
              const isTitleRow = rowIndex === 0; // "Team Trust Framework 3.0"
              const isHeaderRow = rowIndex === 1; // Column headers
              const isFrameworkElement = row[0] && (
                row[0].includes('Framework Element') ||
                row[0].includes('Team Signs') ||
                row[0].includes('Emotional Bank Account') ||
                row[0].includes('Bids for Connection') ||
                row[0].includes('Emotion Coaching') ||
                row[0].includes('Mind Map') ||
                row[0].includes('How to Build Trust') ||
                row[0].includes('Recommended Actions')
                // ✅ FIX: Removed 'Goal' - it should be hidden if empty
              );
              
              // ✅ BUG FIX: Enhanced empty row detection
              // Check if row is completely empty OR only has first column
              const allEmpty = row.every(cell => cell.trim() === '');
              const onlyFirstColumn = row[0].trim() !== '' && row.slice(1).every(cell => cell.trim() === '');
              const shouldHide = allEmpty || (onlyFirstColumn && !isTitleRow && !isHeaderRow && !isFrameworkElement);
              
              return (
                <tr 
                  key={rowIndex}
                  className={`
                    ${isTitleRow ? 'bg-blue-600 text-white font-bold' : ''}
                    ${isHeaderRow ? 'bg-blue-100 font-semibold' : ''}
                    ${isFrameworkElement && !isTitleRow && !isHeaderRow ? 'bg-gray-50' : ''}
                    ${!isTitleRow && !isHeaderRow && !isFrameworkElement && !shouldHide ? 'hover:bg-gray-50' : ''}
                    ${shouldHide ? 'hidden' : ''} 
                  `}
                >
                  {row.map((cell, cellIndex) => {
                    const isFirstColumn = cellIndex === 0;
                    const isEmpty = cell.trim() === '';
                    
                    // For title row, merge all columns
                    if (isTitleRow && cellIndex === 0) {
                      return (
                        <td
                          key={cellIndex}
                          colSpan={row.length}
                          className="border border-blue-700 p-4 text-center text-lg"
                        >
                          {cell}
                        </td>
                      );
                    } else if (isTitleRow && cellIndex > 0) {
                      return null; // Skip other cells in title row (merged)
                    }
                    
                    return (
                      <td
                        key={cellIndex}
                        className={`
                          border border-gray-300 p-3 text-sm
                          ${isFirstColumn && !isTitleRow ? 'font-medium bg-gray-50 w-1/5' : ''}
                          ${isEmpty ? 'bg-gray-50' : ''}
                          ${isTitleRow ? 'text-center' : ''}
                        `}
                      >
                        {cell || ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Framework Elements Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Framework Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span>Emotional Bank Account (EBA)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span>Bids for Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span>Emotion Coaching (Gottman)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span>Mind Map (Team Awareness)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span>How to Build Trust</span>
          </div>
        </div>
      </div>
      
      {/* Trust Level Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Trust Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="text-gray-700">Thriving Team</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧱</span>
            <span className="text-gray-700">Solid Foundation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌧️</span>
            <span className="text-gray-700">Trust Erosion</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <span className="text-gray-700">Gridlock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustFramework;