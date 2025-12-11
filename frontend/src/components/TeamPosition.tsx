/**
 * TeamPosition Component
 * 
 * 显示团队在Trust Matrix中的当前位置，包括：
 * - 象限标识（Thriving Team, Solid Foundation, Trust Erosion, Gridlock）
 * - EBA和Bids分数的进度条
 * - 位置解释和下一步建议
 * 
 * 这是个性化报告的第一部分
 */

import React from 'react';

// ============================================
// 类型定义
// ============================================

export type QuadrantType = 'THRIVING_TEAM' | 'SOLID_FOUNDATION' | 'TRUST_EROSION' | 'GRIDLOCK';

export interface TeamPositionData {
  quadrant: QuadrantType;
  ebaScore: number;        // Emotional Bank Account 得分 (0-100)
  bidsScore: number;       // Bids for Connection 得分 (0-100)
  interpretation: string;  // 位置解释
  nextStep: string;        // 下一步建议
}

interface TeamPositionProps {
  /** 团队位置数据 */
  position: TeamPositionData;
  
  /** 可选的自定义className */
  className?: string;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 获取象限对应的emoji
 */
function getQuadrantEmoji(quadrant: QuadrantType): string {
  const emojiMap: { [key in QuadrantType]: string } = {
    THRIVING_TEAM: '🌿',
    SOLID_FOUNDATION: '🧱',
    TRUST_EROSION: '🌧️',
    GRIDLOCK: '🔒'
  };
  return emojiMap[quadrant];
}

/**
 * 获取象限对应的显示名称
 */
function getQuadrantDisplayName(quadrant: QuadrantType): string {
  const nameMap: { [key in QuadrantType]: string } = {
    THRIVING_TEAM: 'Thriving Team',
    SOLID_FOUNDATION: 'Solid Foundation',
    TRUST_EROSION: 'Trust Erosion',
    GRIDLOCK: 'Gridlock'
  };
  return nameMap[quadrant];
}

/**
 * 获取象限对应的颜色类
 */
function getQuadrantColors(quadrant: QuadrantType) {
  const colorMap: { [key in QuadrantType]: { bg: string; border: string; text: string; badge: string } } = {
    THRIVING_TEAM: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-900',
      badge: 'bg-green-500'
    },
    SOLID_FOUNDATION: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-900',
      badge: 'bg-blue-500'
    },
    TRUST_EROSION: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-900',
      badge: 'bg-yellow-500'
    },
    GRIDLOCK: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-900',
      badge: 'bg-red-500'
    }
  };
  return colorMap[quadrant];
}

/**
 * 获取进度条颜色（基于分数）
 */
function getProgressBarColor(score: number): string {
  if (score >= 75) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 45) return 'bg-yellow-500';
  return 'bg-red-500';
}

// ============================================
// 主组件
// ============================================

/**
 * TeamPosition - 显示团队在Trust Matrix中的位置
 * 
 * @example
 * <TeamPosition
 *   position={{
 *     quadrant: 'SOLID_FOUNDATION',
 *     ebaScore: 68.5,
 *     bidsScore: 45.2,
 *     interpretation: '...',
 *     nextStep: '...'
 *   }}
 * />
 */
const TeamPosition: React.FC<TeamPositionProps> = ({ position, className = '' }) => {
  const colors = getQuadrantColors(position.quadrant);
  const emoji = getQuadrantEmoji(position.quadrant);
  const displayName = getQuadrantDisplayName(position.quadrant);
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${colors.border} p-6 ${className}`}>
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          📍 Your Team Position
        </h3>
        <p className="text-sm text-gray-600">
          See where your team currently stands in the Trust Matrix
        </p>
      </div>
      
      {/* 象限标识 */}
      <div className={`${colors.bg} rounded-lg p-4 mb-4`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{emoji}</span>
          <div>
            <div className="text-sm font-medium text-gray-600">Current Status</div>
            <div className={`text-xl font-bold ${colors.text}`}>
              {displayName}
            </div>
          </div>
        </div>
      </div>
      
      {/* 分数进度条 */}
      <div className="space-y-4 mb-4">
        {/* EBA Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Emotional Bank Account (EBA)
            </span>
            <span className="text-sm font-bold text-gray-900">
              {position.ebaScore.toFixed(1)}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(position.ebaScore)}`}
              style={{ width: `${Math.min(position.ebaScore, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Bids Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Bids for Connection
            </span>
            <span className="text-sm font-bold text-gray-900">
              {position.bidsScore.toFixed(1)}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(position.bidsScore)}`}
              style={{ width: `${Math.min(position.bidsScore, 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 解释 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <span className="text-lg flex-shrink-0">💡</span>
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-1">
              What this means:
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {position.interpretation}
            </p>
          </div>
        </div>
      </div>
      
      {/* 下一步 */}
      <div className={`${colors.bg} rounded-lg p-4 border-l-4 ${colors.border}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg flex-shrink-0">🎯</span>
          <div>
            <div className={`text-sm font-semibold ${colors.text} mb-1`}>
              Your next step:
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {position.nextStep}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPosition;
