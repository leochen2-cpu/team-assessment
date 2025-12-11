/**
 * TrustMatrix Component (Enhanced with Highlighting)
 * 
 * Displays the Team Trust Matrix (2x2 matrix) with:
 * - Thriving Team 🌿
 * - Solid Foundation 🧱
 * - Trust Erosion 🌧️
 * - Gridlock 🔒
 * 
 * 🆕 新功能：
 * - 高亮显示团队当前所在的象限
 * - 其他象限降低透明度（50% opacity）
 * - 显示 "YOU ARE HERE" 徽章
 */

import React, { useEffect, useState } from 'react';
import { getTrustMatrix } from '../service/recommendationService';
import type { TrustMatrixContent } from '../service/recommendationService';

// ============================================
// 类型定义
// ============================================

export type QuadrantType = 'THRIVING_TEAM' | 'SOLID_FOUNDATION' | 'TRUST_EROSION' | 'GRIDLOCK';

interface TrustMatrixProps {
  /** Optional custom className */
  className?: string;
  
  /** 🆕 当前团队所在的象限（如果提供，将高亮显示） */
  currentQuadrant?: QuadrantType;
}

// ============================================
// 辅助函数
// ============================================

/**
 * Helper function to render text with <br> tags
 */
const renderTextWithBreaks = (text: string) => {
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
 * 🆕 判断单元格是否属于当前象限
 */
const isCellInQuadrant = (
  rowIndex: number,
  cellIndex: number,
  quadrant: QuadrantType
): boolean => {
  // Matrix结构分析（基于现有recommendations-data.json）：
  // 第一行是标题，忽略
  // 象限位置：
  // - Thriving Team (🌿): 列1, 行2-5左右
  // - Solid Foundation (🧱): 列2, 行2-5左右
  // - Trust Erosion (🌧️): 列1, 行6-9左右
  // - Gridlock (🔒): 列2, 行6-9左右
  
  // 如果是第一行（标题行），不应用高亮
  if (rowIndex === 0) return false;
  
  // 简化逻辑：通过列和行范围判断象限
  const isUpperHalf = rowIndex >= 1 && rowIndex <= 5;
  const isLowerHalf = rowIndex >= 6 && rowIndex <= 10;
  const isLeftColumn = cellIndex === 1;
  const isRightColumn = cellIndex === 2;
  
  switch (quadrant) {
    case 'THRIVING_TEAM':
      return isUpperHalf && isLeftColumn;
    case 'SOLID_FOUNDATION':
      return isUpperHalf && isRightColumn;
    case 'TRUST_EROSION':
      return isLowerHalf && isLeftColumn;
    case 'GRIDLOCK':
      return isLowerHalf && isRightColumn;
    default:
      return false;
  }
};

/**
 * 🆕 获取象限显示名称
 */
const getQuadrantName = (quadrant: QuadrantType): string => {
  const names = {
    THRIVING_TEAM: 'Thriving Team',
    SOLID_FOUNDATION: 'Solid Foundation',
    TRUST_EROSION: 'Trust Erosion',
    GRIDLOCK: 'Gridlock'
  };
  return names[quadrant];
};

// ============================================
// 主组件
// ============================================

/**
 * TrustMatrix - Displays the Team Trust Matrix as a table
 * 
 * @example
 * // 基础使用（无高亮）
 * <TrustMatrix />
 * 
 * @example
 * // 🆕 带高亮的使用
 * <TrustMatrix currentQuadrant="SOLID_FOUNDATION" />
 */
const TrustMatrix: React.FC<TrustMatrixProps> = ({ 
  className = '',
  currentQuadrant 
}) => {
  const [matrixData, setMatrixData] = useState<TrustMatrixContent | null>(null);
  
  useEffect(() => {
    const data = getTrustMatrix();
    setMatrixData(data);
  }, []);
  
  if (!matrixData) {
    return <div>Loading Trust Matrix...</div>;
  }
  
  // Extract the note row
  const noteRow = matrixData.content.find(row => 
    row.some(cell => cell.includes('** this content is served up'))
  );
  
  const noteText = noteRow 
    ? noteRow.find(cell => cell.includes('** this content is served up')) || ''
    : '';
  
  // Filter out the note row
  const contentRows = matrixData.content.filter(row => 
    !row.some(cell => cell.includes('** this content is served up'))
  );
  
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
        
        {/* 🆕 当前位置指示 */}
        {currentQuadrant && (
          <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-blue-600 font-semibold">✨ YOU ARE HERE:</span>
            <span className="text-blue-900 font-bold">{getQuadrantName(currentQuadrant)}</span>
          </div>
        )}
      </div>
      
      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <tbody>
            {contentRows.map((row, rowIndex) => {
              // Identify special rows
              const isFirstRow = rowIndex === 0;
              const hasHighBalance = row[0] && row[0].includes('High Balance');
              const hasLowBalance = row[0] && row[0].includes('Low Balance');
              const isQuadrantHeader = hasHighBalance || hasLowBalance;
              
              // Trim empty trailing cells
              let trimmedRow = [...row];
              while (trimmedRow.length > 0 && trimmedRow[trimmedRow.length - 1].trim() === '') {
                trimmedRow.pop();
              }
              
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
                    const isFirstColumn = cellIndex === 0;
                    const isEmpty = cell.trim() === '';
                    
                    // 🆕 判断是否在当前象限
                    const isInCurrentQuadrant = currentQuadrant 
                      ? isCellInQuadrant(rowIndex, cellIndex, currentQuadrant)
                      : false;
                    
                    // 🆕 应用淡化效果（非当前象限）
                    const shouldFade = currentQuadrant && !isInCurrentQuadrant && !isFirstRow && cellIndex !== 0;
                    
                    // 🆕 高亮当前象限
                    const highlightClass = isInCurrentQuadrant 
                      ? 'bg-blue-50 border-2 border-blue-400 font-medium' 
                      : '';
                    
                    const fadeClass = shouldFade ? 'opacity-50' : '';
                    
                    return (
                      <td
                        key={cellIndex}
                        className={`
                          border border-gray-300 p-3 text-sm
                          ${isFirstColumn ? 'font-medium bg-gray-50' : ''}
                          ${isEmpty ? 'bg-gray-100' : ''}
                          ${highlightClass}
                          ${fadeClass}
                          transition-opacity duration-300
                        `}
                      >
                        {/* Render <br> tags as actual line breaks */}
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
          <div className={`flex items-center gap-2 ${currentQuadrant === 'THRIVING_TEAM' ? 'font-bold text-blue-600' : ''}`}>
            <span className="text-xl">🌿</span>
            <span className="text-gray-700">Thriving Team</span>
            {currentQuadrant === 'THRIVING_TEAM' && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU ARE HERE</span>
            )}
          </div>
          <div className={`flex items-center gap-2 ${currentQuadrant === 'SOLID_FOUNDATION' ? 'font-bold text-blue-600' : ''}`}>
            <span className="text-xl">🧱</span>
            <span className="text-gray-700">Solid Foundation</span>
            {currentQuadrant === 'SOLID_FOUNDATION' && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU ARE HERE</span>
            )}
          </div>
          <div className={`flex items-center gap-2 ${currentQuadrant === 'TRUST_EROSION' ? 'font-bold text-blue-600' : ''}`}>
            <span className="text-xl">🌧️</span>
            <span className="text-gray-700">Trust Erosion</span>
            {currentQuadrant === 'TRUST_EROSION' && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU ARE HERE</span>
            )}
          </div>
          <div className={`flex items-center gap-2 ${currentQuadrant === 'GRIDLOCK' ? 'font-bold text-blue-600' : ''}`}>
            <span className="text-xl">🔒</span>
            <span className="text-gray-700">Gridlock</span>
            {currentQuadrant === 'GRIDLOCK' && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">YOU ARE HERE</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Note (if exists) */}
      {noteText && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">
            {noteText}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrustMatrix;