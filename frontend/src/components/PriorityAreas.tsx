/**
 * PriorityAreas Component
 * 
 * 显示团队需要优先改进的3个领域，基于最弱的维度
 * 每个优先领域包括：
 * - 维度名称和得分
 * - 当前问题描述
 * - 推荐行动
 * - 对应的Trust Framework元素
 * 
 * 这是个性化报告的第二部分
 */

import React from 'react';

// ============================================
// 类型定义
// ============================================

export interface PriorityArea {
  dimension: string;       // 技术名称 (e.g., "responsiveness")
  displayName: string;     // 显示名称 (e.g., "Responsiveness")
  score: number;           // 该维度得分 (0-100)
  rank: number;            // 优先级排名 (1, 2, 3)
  currentIssue: string;    // 当前问题描述
  recommendedAction: string; // 推荐行动
  frameworkElement: string;  // 对应的框架元素
}

interface PriorityAreasProps {
  /** 优先改进领域数组（最多3个） */
  areas: PriorityArea[];
  
  /** 可选的自定义className */
  className?: string;
  
  /** 可选：点击框架元素时的回调 */
  onFrameworkClick?: (element: string) => void;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 获取优先级对应的颜色
 */
function getPriorityColor(rank: number): {
  bg: string;
  border: string;
  badge: string;
  text: string;
} {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-red-50',
        border: 'border-red-500',
        badge: 'bg-red-500',
        text: 'text-red-900'
      };
    case 2:
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        badge: 'bg-orange-500',
        text: 'text-orange-900'
      };
    case 3:
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        badge: 'bg-yellow-500',
        text: 'text-yellow-900'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-500',
        badge: 'bg-gray-500',
        text: 'text-gray-900'
      };
  }
}

/**
 * 获取分数对应的颜色类
 */
function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 45) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * 获取优先级标签文本
 */
function getPriorityLabel(rank: number): string {
  switch (rank) {
    case 1:
      return 'High Priority';
    case 2:
      return 'Medium Priority';
    case 3:
      return 'Lower Priority';
    default:
      return 'Priority';
  }
}

// ============================================
// 主组件
// ============================================

/**
 * PriorityAreas - 显示优先改进领域
 * 
 * @example
 * <PriorityAreas
 *   areas={[
 *     {
 *       dimension: 'responsiveness',
 *       displayName: 'Responsiveness',
 *       score: 45.2,
 *       rank: 1,
 *       currentIssue: '...',
 *       recommendedAction: '...',
 *       frameworkElement: 'Bids for Connection'
 *     },
 *     ...
 *   ]}
 * />
 */
const PriorityAreas: React.FC<PriorityAreasProps> = ({ 
  areas, 
  className = '',
  onFrameworkClick
}) => {
  
  if (!areas || areas.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No priority areas identified. Great work!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* 标题 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          🎯 Priority Improvement Areas
        </h3>
        <p className="text-sm text-gray-600">
          Based on your team's scores, focus on these areas for maximum impact
        </p>
      </div>
      
      {/* 优先领域列表 */}
      <div className="space-y-4">
        {areas.map((area) => {
          const colors = getPriorityColor(area.rank);
          const priorityLabel = getPriorityLabel(area.rank);
          
          return (
            <div
              key={area.dimension}
              className={`${colors.bg} rounded-lg border-l-4 ${colors.border} p-4 transition-all duration-200 hover:shadow-md`}
            >
              {/* 头部：优先级和得分 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* 优先级徽章 */}
                  <div className={`${colors.badge} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    #{area.rank}
                  </div>
                  
                  {/* 维度名称 */}
                  <div>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {priorityLabel}
                    </div>
                    <div className={`text-lg font-bold ${colors.text}`}>
                      {area.displayName}
                    </div>
                  </div>
                </div>
                
                {/* 得分 */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-600 mb-1">Score</div>
                  <div className={`text-2xl font-bold ${getScoreColor(area.score)}`}>
                    {area.score.toFixed(1)}
                  </div>
                </div>
              </div>
              
              {/* 当前问题 */}
              <div className="mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 mt-0.5">⚠️</span>
                  <div>
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Current Issue
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {area.currentIssue}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 推荐行动 */}
              <div className="mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 mt-0.5">→</span>
                  <div>
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                      Recommended Action
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {area.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 框架元素链接 */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">📚 Learn more:</span>
                  {onFrameworkClick ? (
                    <button
                      onClick={() => onFrameworkClick(area.frameworkElement)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:underline"
                    >
                      {area.frameworkElement}
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-blue-600">
                      {area.frameworkElement}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 底部提示 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <span className="flex-shrink-0">💡</span>
          <p>
            <strong>Tip:</strong> Focus on your #1 priority first. Once you see improvement there, 
            move to the next priority. Taking on all three at once can be overwhelming.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriorityAreas;
