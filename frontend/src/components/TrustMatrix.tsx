/**
 * TrustMatrix Component
 * 
 * Displays the Team Trust Matrix (2x2 matrix) showing:
 * - Thriving Team 🌿
 * - Solid Foundation 🧱
 * - Trust Erosion 🌧️
 * - Gridlock 🔒
 * 
 * This is FIXED CONTENT displayed on all team reports.
 */

import React, { useEffect, useState } from 'react';
import { getTrustMatrix } from '../service/recommendationService';
import type { TrustMatrixContent } from '../service/recommendationService';

interface TrustMatrixProps {
  /** Optional custom className */
  className?: string;
}

/**
 * Helper function to render text with <br> tags
 */
const renderTextWithBreaks = (text: string) => {
  // Split by <br> and render as separate lines
  const parts = text.split('<br>');
  
  if (parts.length === 1) {
    return text;
  }
  
  return (
    <div>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * TrustMatrix - Displays the Team Trust Matrix as a table
 * 
 * @example
 * <TrustMatrix />
 */
const TrustMatrix: React.FC<TrustMatrixProps> = ({ className = '' }) => {
  const [matrixData, setMatrixData] = useState<TrustMatrixContent | null>(null);
  
  useEffect(() => {
    const data = getTrustMatrix();
    setMatrixData(data);
  }, []);
  
  if (!matrixData) {
    return <div>Loading Trust Matrix...</div>;
  }
  
  // ✅ FIX: Extract the note row (the one with "** this content is served up...")
  const noteRow = matrixData.content.find(row => 
    row.some(cell => cell.includes('** this content is served up'))
  );
  
  // Get the note text (it's in one of the cells, usually the last one with content)
  const noteText = noteRow ? noteRow.find(cell => cell.includes('** this content')) : null;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {matrixData.title}
        </h2>
        <p className="text-gray-600">
          {matrixData.description}
        </p>
        
        {/* ✅ FIX: Show note as subtitle, not in table */}
        {noteText && (
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-gray-700 italic">
              {noteText.replace('** ', '').trim()}
            </p>
          </div>
        )}
      </div>
      
      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <tbody>
            {matrixData.content.map((row, rowIndex) => {
              // ✅ Skip the note row - it's already displayed above
              const isNoteRow = row.some(cell => cell.includes('** this content is served up'));
              if (isNoteRow) {
                return null;
              }
              
              // ✅ ENHANCED: Check if row is completely empty OR only has first column
              const isEmptyRow = row.every(cell => cell.trim() === '');
              const onlyFirstColumn = row[0].trim() !== '' && row.slice(1).every(cell => cell.trim() === '');
              
              // Skip empty rows or rows with only first column content
              if (isEmptyRow || onlyFirstColumn) {
                return null;
              }
              
              // ✅ FIX: Remove trailing empty cells to avoid empty columns
              let lastNonEmptyIndex = row.length - 1;
              while (lastNonEmptyIndex > 0 && row[lastNonEmptyIndex].trim() === '') {
                lastNonEmptyIndex--;
              }
              const trimmedRow = row.slice(0, lastNonEmptyIndex + 1);
              
              // Check if this is a header row (contains emoji indicators)
              const isQuadrantHeader = row.some(cell => 
                cell.includes('🌿') || cell.includes('🧱') || 
                cell.includes('🌧️') || cell.includes('🔒')
              );
              
              // Check if this is the first row (column headers)
              const isFirstRow = rowIndex === 0;
              
              return (
                <tr 
                  key={rowIndex}
                  className={`
                    ${isFirstRow ? 'bg-blue-100 font-semibold' : ''}
                    ${isQuadrantHeader && !isFirstRow ? 'bg-gray-50 font-semibold border-t-2 border-gray-300' : ''}
                    ${!isFirstRow && !isQuadrantHeader ? 'hover:bg-gray-50' : ''}
                  `}
                >
                  {trimmedRow.map((cell, cellIndex) => {
                    // Determine cell styling
                    const isFirstColumn = cellIndex === 0;
                    const isEmpty = cell.trim() === '';
                    
                    return (
                      <td
                        key={cellIndex}
                        className={`
                          border border-gray-300 p-3 text-sm
                          ${isFirstColumn ? 'font-medium bg-gray-50' : ''}
                          ${isEmpty ? 'bg-gray-100' : ''}
                        `}
                      >
                        {/* ✅ FIX: Render <br> tags as actual line breaks */}
                        {renderTextWithBreaks(cell || '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
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

export default TrustMatrix;