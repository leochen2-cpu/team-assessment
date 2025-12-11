/**
 * Team Personalization Service
 * 
 * 为团队报告提供个性化算法：
 * 1. 确定团队在Trust Matrix中的位置（象限）
 * 2. 识别优先改进领域（最弱的3个维度）
 * 3. 生成个性化推荐
 */

// ============================================
// 类型定义
// ============================================

/**
 * 团队维度分数（来自现有系统）
 */
export interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
  warningSigns: number;
}

/**
 * 团队象限位置
 */
export type QuadrantType = 'THRIVING_TEAM' | 'SOLID_FOUNDATION' | 'TRUST_EROSION' | 'GRIDLOCK';

/**
 * 团队位置数据
 */
export interface TeamPosition {
  quadrant: QuadrantType;
  ebaScore: number;        // Emotional Bank Account 得分
  bidsScore: number;       // Bids for Connection 得分
  interpretation: string;  // 位置解释
  nextStep: string;        // 下一步建议
}

/**
 * 优先改进领域
 */
export interface PriorityArea {
  dimension: string;       // 技术名称 (e.g., "responsiveness")
  displayName: string;     // 显示名称 (e.g., "Responsiveness")
  score: number;           // 该维度得分
  rank: number;            // 优先级排名 (1, 2, 3)
  currentIssue: string;    // 当前问题描述
  recommendedAction: string; // 推荐行动
  frameworkElement: string;  // 对应的框架元素
}

/**
 * 个性化推荐
 */
export interface PersonalizedRecommendations {
  immediate: string[];     // 立即行动
  shortTerm: string[];     // 短期目标（1-2周）
  longTerm: string[];      // 长期目标（1-3月）
  maintenanceActions: string[]; // 维护性行动（对于高分团队）
}

// ============================================
// 核心算法 1: 计算 EBA 和 Bids 分数
// ============================================

/**
 * 将7个维度映射到EBA (Emotional Bank Account)
 * 
 * 基于Gottman理论：EBA代表信任储备、正向互动
 * 
 * 权重分配：
 * - Trust & Positivity (35%): 信任是EBA的核心
 * - Appreciation (30%): 欣赏是主要的"存款"行为
 * - Goal Support (20%): 支持是积极的存款
 * - Warning Signs (15%): 健康沟通保护EBA不被"提取"
 */
export function calculateEBA(dimensions: DimensionScores): number {
  const eba = 
    dimensions.trustPositivity * 0.35 +
    dimensions.appreciation * 0.30 +
    dimensions.goalSupport * 0.20 +
    dimensions.warningSigns * 0.15;
  
  return Math.round(eba * 10) / 10; // 保留1位小数
}

/**
 * 将7个维度映射到Bids (Bids for Connection)
 * 
 * 基于Gottman理论：Bids代表主动联系和回应性
 * 
 * 权重分配：
 * - Responsiveness (40%): 回应性是Bids的核心
 * - Team Connection (35%): 主动联结和理解
 * - Conflict Management (25%): 处理负面邀请的能力
 */
export function calculateBids(dimensions: DimensionScores): number {
  const bids = 
    dimensions.responsiveness * 0.40 +
    dimensions.teamConnection * 0.35 +
    dimensions.conflictManagement * 0.25;
  
  return Math.round(bids * 10) / 10; // 保留1位小数
}

// ============================================
// 核心算法 2: 确定团队象限位置
// ============================================

/**
 * 根据EBA和Bids分数确定团队在Trust Matrix中的象限
 * 
 * 象限定义（阈值 = 60）：
 * - Thriving Team (🌿): EBA ≥ 60 && Bids ≥ 60
 * - Solid Foundation (🧱): EBA ≥ 60 && Bids < 60
 * - Trust Erosion (🌧️): EBA < 60 && Bids ≥ 60
 * - Gridlock (🔒): EBA < 60 && Bids < 60
 * 
 * @param dimensions - 7个维度的得分
 * @returns TeamPosition 对象，包含象限、分数、解释和下一步
 */
export function determineTeamPosition(dimensions: DimensionScores): TeamPosition {
  const ebaScore = calculateEBA(dimensions);
  const bidsScore = calculateBids(dimensions);
  
  // 使用 60 作为"高"的阈值
  const HIGH_THRESHOLD = 60;
  
  let quadrant: QuadrantType;
  let interpretation: string;
  let nextStep: string;
  
  if (ebaScore >= HIGH_THRESHOLD && bidsScore >= HIGH_THRESHOLD) {
    quadrant = 'THRIVING_TEAM';
    interpretation = 'Your team has strong trust and high responsiveness. You demonstrate psychological safety, open collaboration, and creativity. Focus on maintaining these strengths.';
    nextStep = 'Maintain current practices and model behavior for other teams. Consider mentoring teams that need support.';
  } 
  else if (ebaScore >= HIGH_THRESHOLD && bidsScore < HIGH_THRESHOLD) {
    quadrant = 'SOLID_FOUNDATION';
    interpretation = 'Your team has strong trust foundations (high EBA) but needs to improve responsiveness to connection attempts. Team members have reliable trust but miss opportunities for deeper engagement.';
    nextStep = 'Move toward Thriving Team 🌿 by improving Bids for Connection scores. Focus on noticing and responding to subtle connection attempts.';
  } 
  else if (ebaScore < HIGH_THRESHOLD && bidsScore >= HIGH_THRESHOLD) {
    quadrant = 'TRUST_EROSION';
    interpretation = 'Your team is responsive to bids but trust reserves are depleting. There may be increasing defensiveness, miscommunication, or unaddressed issues. Rebuild the Emotional Bank Account.';
    nextStep = 'Rebuild trust through consistent positive interactions, keeping promises, and repairing small ruptures before they harden. Use gentle start-ups in difficult conversations.';
  } 
  else {
    quadrant = 'GRIDLOCK';
    interpretation = 'Your team faces challenges in both trust and responsiveness. Blame cycles, avoidance, or broken psychological safety may be present. This requires focused attention and systematic improvement.';
    nextStep = 'Pause execution for trust repair. Start with small trust-building actions, co-create a recovery plan, and gradually improve bid responsiveness through structured repair sessions.';
  }
  
  return {
    quadrant,
    ebaScore,
    bidsScore,
    interpretation,
    nextStep
  };
}

// ============================================
// 核心算法 3: 识别优先改进领域
// ============================================

/**
 * 维度到用户友好名称的映射
 */
const DIMENSION_DISPLAY_NAMES: { [key: string]: string } = {
  teamConnection: 'Team Connection',
  appreciation: 'Appreciation',
  responsiveness: 'Responsiveness',
  trustPositivity: 'Trust & Positivity',
  conflictManagement: 'Conflict Management',
  goalSupport: 'Goal Support',
  warningSigns: 'Healthy Communication'
};

/**
 * 维度到Trust Framework元素的映射
 */
const DIMENSION_FRAMEWORK_MAP: { [key: string]: string } = {
  teamConnection: 'Mind Map (Team Awareness)',
  appreciation: 'Emotional Bank Account (EBA)',
  responsiveness: 'Bids for Connection',
  trustPositivity: 'Emotional Bank Account (EBA)',
  conflictManagement: 'Emotion Coaching (Gottman)',
  goalSupport: 'How to Build Trust',
  warningSigns: 'Team Signs'
};

/**
 * 根据象限和维度获取当前问题描述
 */
function getCurrentIssue(dimension: string, score: number, quadrant: QuadrantType): string {
  const issueMap: { [key: string]: { [key in QuadrantType]: string } } = {
    teamConnection: {
      THRIVING_TEAM: 'Strong mutual understanding maintained',
      SOLID_FOUNDATION: 'Some gaps in shared understanding',
      TRUST_EROSION: 'Misalignment on team priorities',
      GRIDLOCK: 'Severe disconnection between members'
    },
    appreciation: {
      THRIVING_TEAM: 'Gratitude culture established',
      SOLID_FOUNDATION: 'Appreciation expressed but could be more frequent',
      TRUST_EROSION: 'Contributions going unrecognized',
      GRIDLOCK: 'Lack of positive acknowledgment'
    },
    responsiveness: {
      THRIVING_TEAM: 'Excellent bid awareness',
      SOLID_FOUNDATION: 'Team members miss or dismiss some bids',
      TRUST_EROSION: 'Defensive responses to connection attempts',
      GRIDLOCK: 'Bids met with resistance or avoidance'
    },
    trustPositivity: {
      THRIVING_TEAM: 'High trust and optimism',
      SOLID_FOUNDATION: 'Trust present but cautious optimism',
      TRUST_EROSION: 'Trust reserves depleting',
      GRIDLOCK: 'Broken trust and cynicism'
    },
    conflictManagement: {
      THRIVING_TEAM: 'Conflicts handled constructively',
      SOLID_FOUNDATION: 'Some conflicts avoided or escalated',
      TRUST_EROSION: 'Increasing defensiveness in disagreements',
      GRIDLOCK: 'Blame cycles and unresolved conflicts'
    },
    goalSupport: {
      THRIVING_TEAM: 'Strong mutual support for goals',
      SOLID_FOUNDATION: 'Support available but not always proactive',
      TRUST_EROSION: 'Goals pursued independently',
      GRIDLOCK: 'Competitive or undermining behavior'
    },
    warningSigns: {
      THRIVING_TEAM: 'Healthy communication patterns',
      SOLID_FOUNDATION: 'Occasional criticism or defensiveness',
      TRUST_EROSION: 'Frequent negative patterns emerging',
      GRIDLOCK: 'Destructive communication dominant'
    }
  };
  
  return issueMap[dimension]?.[quadrant] || 'Needs improvement';
}

/**
 * 根据象限和维度获取推荐行动
 */
function getRecommendedAction(dimension: string, score: number, quadrant: QuadrantType): string {
  const actionMap: { [key: string]: { [key in QuadrantType]: string } } = {
    teamConnection: {
      THRIVING_TEAM: 'Model inclusive behavior for other teams',
      SOLID_FOUNDATION: 'Hold regular team alignment sessions',
      TRUST_EROSION: 'Clarify shared goals and priorities',
      GRIDLOCK: 'Establish basic communication protocols'
    },
    appreciation: {
      THRIVING_TEAM: 'Continue rituals of appreciation',
      SOLID_FOUNDATION: 'Implement weekly gratitude practice',
      TRUST_EROSION: 'Increase positive deposits to EBA',
      GRIDLOCK: 'Start with small, specific acknowledgments'
    },
    responsiveness: {
      THRIVING_TEAM: 'Recognize and respond to subtle bids',
      SOLID_FOUNDATION: 'Practice noticing missed bids and follow up',
      TRUST_EROSION: 'Use gentle start-ups and validation',
      GRIDLOCK: 'Respond calmly to micro-bids; use repair attempts'
    },
    trustPositivity: {
      THRIVING_TEAM: 'Maintain 5:1 positive-to-negative ratio',
      SOLID_FOUNDATION: 'Add transparency deposits; share context',
      TRUST_EROSION: 'Repair withdrawals directly',
      GRIDLOCK: 'Pause for structured trust repair sessions'
    },
    conflictManagement: {
      THRIVING_TEAM: 'Continue using constructive conflict tools',
      SOLID_FOUNDATION: 'Practice "softened start-ups" in disagreements',
      TRUST_EROSION: 'Validate emotions before problem-solving',
      GRIDLOCK: 'Use facilitated repair sessions with neutral party'
    },
    goalSupport: {
      THRIVING_TEAM: 'Mentor other teams on support practices',
      SOLID_FOUNDATION: 'Create individual development check-ins',
      TRUST_EROSION: 'Reaffirm shared values and mutual benefit',
      GRIDLOCK: 'Rebuild reliability through small commitments'
    },
    warningSigns: {
      THRIVING_TEAM: 'Model healthy communication',
      SOLID_FOUNDATION: 'Notice and address criticism patterns early',
      TRUST_EROSION: 'Replace criticism with "I feel" statements',
      GRIDLOCK: 'Commit to communication ground rules'
    }
  };
  
  return actionMap[dimension]?.[quadrant] || 'Focus on improvement';
}

/**
 * 识别优先改进领域（最弱的3个维度）
 * 
 * 步骤：
 * 1. 将7个维度按得分从低到高排序
 * 2. 取最低的3个维度
 * 3. 为每个维度生成详细信息（问题、行动、框架元素）
 * 
 * @param dimensions - 7个维度的得分
 * @param teamPosition - 团队位置（用于个性化问题和建议）
 * @returns 按优先级排序的改进领域数组（最多3个）
 */
export function identifyPriorityAreas(
  dimensions: DimensionScores,
  teamPosition: TeamPosition
): PriorityArea[] {
  
  // 1. 将维度转换为数组并按分数排序（低到高）
  const dimensionArray = Object.entries(dimensions)
    .map(([key, score]) => ({ key, score }))
    .sort((a, b) => a.score - b.score);
  
  // 2. 取最低的3个维度
  const top3Weakest = dimensionArray.slice(0, 3);
  
  // 3. 构建优先改进领域
  const priorityAreas: PriorityArea[] = top3Weakest.map((item, index) => {
    return {
      dimension: item.key,
      displayName: DIMENSION_DISPLAY_NAMES[item.key] || item.key,
      score: Math.round(item.score * 10) / 10,
      rank: index + 1,
      currentIssue: getCurrentIssue(item.key, item.score, teamPosition.quadrant),
      recommendedAction: getRecommendedAction(item.key, item.score, teamPosition.quadrant),
      frameworkElement: DIMENSION_FRAMEWORK_MAP[item.key] || 'Trust Framework'
    };
  });
  
  return priorityAreas;
}

// ============================================
// 核心算法 4: 生成个性化推荐
// ============================================

/**
 * 根据团队位置和优先领域生成个性化推荐
 * 
 * 推荐分为4类：
 * - immediate: 立即可以执行的行动（本周）
 * - shortTerm: 短期目标（1-2周）
 * - longTerm: 长期改进（1-3月）
 * - maintenanceActions: 维护性行动（仅对高分团队）
 * 
 * @param teamPosition - 团队位置
 * @param priorityAreas - 优先改进领域
 * @param dimensions - 原始维度分数
 * @returns PersonalizedRecommendations 对象
 */
export function generatePersonalizedRecommendations(
  teamPosition: TeamPosition,
  priorityAreas: PriorityArea[],
  dimensions: DimensionScores
): PersonalizedRecommendations {
  
  const recommendations: PersonalizedRecommendations = {
    immediate: [],
    shortTerm: [],
    longTerm: [],
    maintenanceActions: []
  };
  
  // 根据象限生成基础推荐
  switch (teamPosition.quadrant) {
    case 'THRIVING_TEAM':
      recommendations.immediate = [
        'Continue your 5:1 positive-to-negative interaction ratio',
        'Share your successful practices with other teams',
        'Maintain your gratitude rituals and team connection practices'
      ];
      recommendations.shortTerm = [
        'Document your team\'s collaboration best practices',
        'Offer to mentor teams that are struggling'
      ];
      recommendations.longTerm = [
        'Explore advanced collaboration techniques',
        'Set stretch goals for team innovation'
      ];
      recommendations.maintenanceActions = [
        'Schedule regular "trust tune-ups" every 2 months',
        'Keep tracking team health metrics',
        'Celebrate team successes together'
      ];
      break;
      
    case 'SOLID_FOUNDATION':
      recommendations.immediate = [
        `Focus on ${priorityAreas[0].displayName}: ${priorityAreas[0].recommendedAction}`,
        'Set up weekly "bid awareness" check-ins (15 minutes)',
        'Practice noticing when team members make connection attempts'
      ];
      recommendations.shortTerm = [
        'Create team norm: "No bid left behind" - acknowledge all connection attempts',
        `Address ${priorityAreas[1].displayName}: ${priorityAreas[1].recommendedAction}`,
        'Increase transparency in decision-making processes'
      ];
      recommendations.longTerm = [
        'Deepen vulnerability and psychological safety',
        'Develop more sophisticated conflict resolution skills',
        'Move toward Thriving Team status'
      ];
      break;
      
    case 'TRUST_EROSION':
      recommendations.immediate = [
        'Repair small ruptures before they harden - address issues within 24 hours',
        `Priority repair: ${priorityAreas[0].displayName}`,
        'Use gentle start-ups: "I feel..." instead of "You always..."'
      ];
      recommendations.shortTerm = [
        'Rebuild Emotional Bank Account through consistent positive interactions',
        'Hold a team "trust repair" session to address underlying issues',
        `Work on ${priorityAreas[1].displayName} and ${priorityAreas[2].displayName}`
      ];
      recommendations.longTerm = [
        'Establish rituals of appreciation and recognition',
        'Develop shared understanding of team goals and values',
        'Build back to Solid Foundation level'
      ];
      break;
      
    case 'GRIDLOCK':
      recommendations.immediate = [
        'PAUSE execution for trust repair - this is critical',
        'Bring in a neutral facilitator for structured repair sessions',
        'Commit to basic communication ground rules as a team'
      ];
      recommendations.shortTerm = [
        'Co-create a trust recovery plan with all team members',
        'Start with small, achievable trust-building commitments',
        `Focus intensively on ${priorityAreas[0].displayName}`
      ];
      recommendations.longTerm = [
        'Rebuild reliability through consistent follow-through on commitments',
        'Gradually improve bid responsiveness',
        'Work systematically through all priority areas',
        'Consider team coaching or professional facilitation'
      ];
      break;
  }
  
  return recommendations;
}

// ============================================
// 导出完整的个性化数据生成函数
// ============================================

/**
 * 生成完整的个性化数据包
 * 
 * 这是主函数，应该在计算团队报告时调用
 * 
 * @param dimensions - 7个维度的得分
 * @returns 包含所有个性化数据的对象
 */
export function generatePersonalizationData(dimensions: DimensionScores) {
  // 1. 确定团队位置
  const teamPosition = determineTeamPosition(dimensions);
  
  // 2. 识别优先改进领域
  const priorityAreas = identifyPriorityAreas(dimensions, teamPosition);
  
  // 3. 生成个性化推荐
  const recommendations = generatePersonalizedRecommendations(
    teamPosition,
    priorityAreas,
    dimensions
  );
  
  return {
    teamPosition,
    priorityAreas,
    recommendations
  };
}

// ============================================
// 辅助函数：获取象限的emoji和颜色
// ============================================

/**
 * 获取象限对应的emoji
 */
export function getQuadrantEmoji(quadrant: QuadrantType): string {
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
export function getQuadrantDisplayName(quadrant: QuadrantType): string {
  const nameMap: { [key in QuadrantType]: string } = {
    THRIVING_TEAM: 'Thriving Team',
    SOLID_FOUNDATION: 'Solid Foundation',
    TRUST_EROSION: 'Trust Erosion',
    GRIDLOCK: 'Gridlock'
  };
  return nameMap[quadrant];
}

/**
 * 获取象限对应的Tailwind CSS颜色类
 */
export function getQuadrantColors(quadrant: QuadrantType) {
  const colorMap: { [key in QuadrantType]: { bg: string; border: string; text: string } } = {
    THRIVING_TEAM: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-900'
    },
    SOLID_FOUNDATION: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-900'
    },
    TRUST_EROSION: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-900'
    },
    GRIDLOCK: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-900'
    }
  };
  return colorMap[quadrant];
}
