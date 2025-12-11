/**
 * TrustFramework Component (Enhanced with Smart Collapsing)
 * 
 * Displays the Team Trust Framework 3.0 with:
 * - Detailed guidance across different trust levels
 * - Framework elements: EBA, Bids, Emotion Coaching, Mind Map, How to Build Trust
 * 
 * 🆕 新功能：
 * - 智能折叠：根据优先领域自动展开/折叠框架元素
 * - 优先元素标记
 * - 可交互的展开/折叠功能
 */

import React, { useEffect, useState } from 'react';
import { getTrustFramework } from '../service/recommendationService';
import type { TrustFrameworkContent } from '../service/recommendationService';

// ============================================
// 类型定义
// ============================================

export interface PriorityElement {
  dimension: string;
  frameworkElement: string;  // e.g., "Bids for Connection"
  rank: number;
}

interface TrustFrameworkProps {
  /** Optional custom className */
  className?: string;
  
  /** 🆕 优先框架元素（如果提供，将自动展开这些元素） */
  priorityElements?: PriorityElement[];
}

// ============================================
// 框架元素映射
// ============================================

/**
 * 框架元素名称标准化
 */
const FRAMEWORK_ELEMENTS = [
  'Team Signs',
  'Emotional Bank Account',
  'Bids for Connection',
  'Emotion Coaching',
  'Mind Map',
  'How to Build Trust',
  'Recommended Actions'
];

/**
 * 判断行是否是框架元素标题
 */
const isFrameworkElementRow = (row: string[]): boolean => {
  const firstCell = row[0] || '';
  return FRAMEWORK_ELEMENTS.some(element => firstCell.includes(element));
};

/**
 * 获取框架元素名称
 */
const getFrameworkElementName = (row: string[]): string | null => {
  const firstCell = row[0] || '';
  const element = FRAMEWORK_ELEMENTS.find(e => firstCell.includes(e));
  return element || null;
};

// ============================================
// 主组件
// ============================================

/**
 * TrustFramework - Displays the Trust Framework 3.0 with smart collapsing
 * 
 * @example
 * // 基础使用（无折叠）
 * <TrustFramework />
 * 
 * @example
 * // 🆕 带智能折叠的使用
 * <TrustFramework
 *   priorityElements={[
 *     { dimension: 'responsiveness', frameworkElement: 'Bids for Connection', rank: 1 },
 *     { dimension: 'conflictManagement', frameworkElement: 'Emotion Coaching', rank: 2 }
 *   ]}
 * />
 */
const TrustFramework: React.FC<TrustFrameworkProps> = ({ 
  className = '',
  priorityElements = []
}) => {
  const [frameworkData, setFrameworkData] = useState<TrustFrameworkContent | null>(null);
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const data = getTrustFramework();
    setFrameworkData(data);
    
    // 🆕 自动展开优先元素
    if (priorityElements && priorityElements.length > 0) {
      const priorityNames = new Set(priorityElements.map(p => p.frameworkElement));
      setExpandedElements(priorityNames);
    } else {
      // 如果没有优先元素，默认全部展开
      setExpandedElements(new Set(FRAMEWORK_ELEMENTS));
    }
  }, [priorityElements]);
  
  if (!frameworkData) {
    return <div>Loading Trust Framework...</div>;
  }
  
  /**
   * 🆕 切换框架元素的展开/折叠状态
   */
  const toggleElement = (elementName: string) => {
    setExpandedElements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementName)) {
        newSet.delete(elementName);
      } else {
        newSet.add(elementName);
      }
      return newSet;
    });
  };
  
  /**
   * 🆕 判断元素是否是优先元素
   */
  const isPriorityElement = (elementName: string): number | null => {
    const priority = priorityElements.find(p => p.frameworkElement === elementName);
    return priority ? priority.rank : null;
  };
  
  /**
   * 🆕 获取优先级徽章颜色
   */
  const getPriorityBadgeColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  // 🆕 将内容按框架元素分组
  const groupedContent: { [key: string]: string[][] } = {};
  let currentElement: string | null = null;
  
  frameworkData.content.forEach((row, index) => {
    // 跳过标题行和列标题行
    if (index === 0 || index === 1) {
      if (!groupedContent['_header']) groupedContent['_header'] = [];
      groupedContent['_header'].push(row);
      return;
    }
    
    // 检查是否是框架元素行
    if (isFrameworkElementRow(row)) {
      currentElement = getFrameworkElementName(row);
      if (currentElement && !groupedContent[currentElement]) {
        groupedContent[currentElement] = [];
      }
    }
    
    // 添加行到当前元素
    if (currentElement && groupedContent[currentElement]) {
      groupedContent[currentElement].push(row);
    }
  });
  
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
        
        {/* 🆕 优先元素提示 */}
        {priorityElements && priorityElements.length > 0 && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-lg flex-shrink-0">🎯</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-900 mb-1">
                  Priority Elements for Your Team
                </div>
                <div className="text-sm text-blue-700">
                  The following sections are automatically expanded based on your priority areas:
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {priorityElements.map(p => (
                    <span
                      key={p.dimension}
                      className={`text-xs font-medium text-white px-2 py-1 rounded ${getPriorityBadgeColor(p.rank)}`}
                    >
                      #{p.rank} {p.frameworkElement}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Framework Table Header */}
      {groupedContent['_header'] && (
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border-collapse">
            <tbody>
              {groupedContent['_header'].map((row, index) => (
                <tr key={`header-${index}`} className={index === 0 ? 'bg-blue-100 font-bold text-center' : 'bg-gray-100 font-semibold'}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 p-3 text-sm">
                      {cell || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 🆕 Framework Elements (Collapsible) */}
      <div className="space-y-3">
        {FRAMEWORK_ELEMENTS.map(elementName => {
          const rows = groupedContent[elementName];
          if (!rows || rows.length === 0) return null;
          
          const isExpanded = expandedElements.has(elementName);
          const priorityRank = isPriorityElement(elementName);
          const isPriority = priorityRank !== null;
          
          return (
            <div
              key={elementName}
              className={`border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                isPriority ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Element Header (Clickable) */}
              <button
                onClick={() => toggleElement(elementName)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isPriority ? 'bg-blue-100 hover:bg-blue-200' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Expand/Collapse Icon */}
                  <span className="text-gray-600 text-lg">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  
                  {/* Element Name */}
                  <span className={`font-bold ${isPriority ? 'text-blue-900' : 'text-gray-900'}`}>
                    {elementName}
                  </span>
                  
                  {/* Priority Badge */}
                  {isPriority && (
                    <span className={`text-xs font-bold text-white px-2 py-1 rounded ${getPriorityBadgeColor(priorityRank!)}`}>
                      YOUR #{priorityRank} PRIORITY ⚠️
                    </span>
                  )}
                </div>
                
                {/* Row Count */}
                <span className="text-xs text-gray-500">
                  {isExpanded ? 'Click to collapse' : 'Click to expand'}
                </span>
              </button>
              
              {/* Element Content (Collapsible) */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <tbody>
                        {rows.map((row, rowIndex) => {
                          // Skip completely empty rows
                          const allEmpty = row.every(cell => cell.trim() === '');
                          const onlyFirstColumn = row[0].trim() !== '' && row.slice(1).every(cell => cell.trim() === '');
                          const isElementTitleRow = rowIndex === 0;
                          
                          if (allEmpty || (onlyFirstColumn && !isElementTitleRow)) {
                            return null;
                          }
                          
                          return (
                            <tr key={rowIndex} className={isElementTitleRow ? 'bg-gray-50 font-medium' : ''}>
                              {row.map((cell, cellIndex) => {
                                const isFirstColumn = cellIndex === 0;
                                const isEmpty = cell.trim() === '';
                                
                                return (
                                  <td
                                    key={cellIndex}
                                    className={`
                                      border border-gray-300 p-3 text-sm
                                      ${isFirstColumn ? 'font-medium bg-gray-50 w-1/5' : ''}
                                      ${isEmpty ? 'bg-gray-50' : ''}
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
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
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