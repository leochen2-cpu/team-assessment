export interface AssessmentResponses {
  [key: string]: number; // Q1: 4, Q2: 5, ...
}

export interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
  warningSigns: number;
}

// 维度题目映射（基于27题问卷）
const DIMENSION_QUESTIONS = {
  teamConnection: ['Q1', 'Q2', 'Q3'],
  appreciation: ['Q4', 'Q5', 'Q6'],
  responsiveness: ['Q7', 'Q8', 'Q9'],
  trustPositivity: ['Q10', 'Q11', 'Q12', 'Q13'],
  conflictManagement: ['Q14', 'Q15', 'Q16'],
  goalSupport: ['Q17', 'Q18', 'Q19', 'Q20'],
  warningSigns: ['Q21', 'Q22', 'Q23', 'Q24', 'Q25', 'Q26', 'Q27'],
};

// 维度权重（危险信号占40%）
const DIMENSION_WEIGHTS = {
  teamConnection: 0.10,
  appreciation: 0.10,
  responsiveness: 0.10,
  trustPositivity: 0.10,
  conflictManagement: 0.10,
  goalSupport: 0.10,
  warningSigns: 0.40,
};

/**
 * 计算各维度得分
 * 每个维度的得分 = (该维度所有题目平均分) × 20
 * 转换为0-100分制
 */
export function calculateDimensionScores(
  responses: AssessmentResponses
): DimensionScores {
  const scores: any = {};

  for (const [dimension, questions] of Object.entries(DIMENSION_QUESTIONS)) {
    let sum = 0;
    let count = 0;

    for (const q of questions) {
      if (responses[q] !== undefined) {
        // Q22是反向计分题："我观察到不尊重行为"
        // 1分(很频繁)应该得分低，5分(从不)应该得分高
        if (q === 'Q22') {
          sum += 6 - responses[q]; // 反向：5->1, 4->2, 3->3, 2->4, 1->5
        } else {
          sum += responses[q];
        }
        count++;
      }
    }

    // 维度得分 = 平均分 × 20（转换为0-100分制）
    scores[dimension] = count > 0 ? (sum / count) * 20 : 0;
  }

  return scores as DimensionScores;
}

/**
 * 计算个人总分
 * 使用加权平均，危险信号占40%权重
 */
export function calculatePersonalScore(
  dimensionScores: DimensionScores
): number {
  let totalScore = 0;

  for (const [dimension, score] of Object.entries(dimensionScores)) {
    const weight = DIMENSION_WEIGHTS[dimension as keyof DimensionScores];
    totalScore += score * weight;
  }

  return Math.round(totalScore * 10) / 10; // 保留1位小数
}

/**
 * 根据分数获取等级
 */
export function getScoreGrade(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Needs improvement';
  return 'Alert';
}

/**
 * 识别优势领域（得分>80）
 */
export function identifyStrengths(dimensionScores: DimensionScores): string[] {
  const dimensionNames: { [key: string]: string } = {
    teamConnection: 'Team Connection',
    appreciation: 'Appreiciation',
    responsiveness: 'Responsiveness',
    trustPositivity: 'Trust and Positivitiy',
    conflictManagement: 'Conflict Management',
    goalSupport: 'Goal Support',
    warningSigns: 'Healthy Communication',
  };

  const strengths: string[] = [];
  for (const [dimension, score] of Object.entries(dimensionScores)) {
    if (score >= 80) {
      strengths.push(dimensionNames[dimension]);
    }
  }

  return strengths.length > 0 ? strengths : ['继续保持当前水平'];
}

/**
 * 识别成长领域（得分<70）
 */
export function identifyGrowthAreas(dimensionScores: DimensionScores): string[] {
  const dimensionNames: { [key: string]: string } = {
    teamConnection: '团队联结',
    appreciation: '认可与欣赏',
    responsiveness: '积极回应',
    trustPositivity: '信任与正向',
    conflictManagement: '冲突管理',
    goalSupport: '目标支持',
    warningSigns: '健康沟通',
  };

  const growthAreas: string[] = [];
  for (const [dimension, score] of Object.entries(dimensionScores)) {
    if (score < 70) {
      growthAreas.push(dimensionNames[dimension]);
    }
  }

  return growthAreas.length > 0 ? growthAreas : ['所有维度表现良好'];
}

/**
 * 生成个性化建议
 */
export function generateRecommendations(
  dimensionScores: DimensionScores
): string[] {
  const recommendations: string[] = [];
  
  if (dimensionScores.warningSigns < 60) {
    recommendations.push('注意沟通方式：尝试用"我"开头表达感受，避免指责性语言');
    recommendations.push('本周目标：在提出批评时，先肯定对方的努力');
  }
  
  if (dimensionScores.conflictManagement < 65) {
    recommendations.push('提升冲突处理能力：遇到分歧时，先理解对方观点再表达自己的看法');
    recommendations.push('推荐阅读：《关键对话》- 学习如何在高风险场景下有效沟通');
  }
  
  if (dimensionScores.appreciation < 70) {
    recommendations.push('增加积极反馈：每天至少向一位同事表达具体的感谢或认可');
  }
  
  if (dimensionScores.teamConnection < 70) {
    recommendations.push('加深团队了解：每周与一位同事进行非工作话题的交流');
  }

  if (recommendations.length === 0) {
    recommendations.push('继续保持优秀表现！可以考虑分享你的协作经验帮助他人');
  }

  return recommendations;
}

/**
 * 计算团队效能分数
 */
export function calculateTeamScore(
  personalScores: number[],
  warningSignsScores: number[]
): {
  teamScore: number;
  baseScore: number;
  consistencyFactor: number;
  penaltyFactor: number;
  standardDeviation: number;
} {
  const n = personalScores.length;

  // 1. 基础平均分
  const baseScore = personalScores.reduce((a, b) => a + b, 0) / n;

  // 2. 计算标准差（衡量一致性）
  const mean = baseScore;
  const variance = personalScores.reduce((sum, score) => {
    return sum + Math.pow(score - mean, 2);
  }, 0) / n;
  const stdDev = Math.sqrt(variance);

  // 3. 一致性系数（标准差越小，一致性越高）
  const consistencyFactor = Math.max(0, 1 - stdDev / 30);

  // 4. 危险信号惩罚
  const dangerousMembers = warningSignsScores.filter(score => score < 50).length;
  const dangerRatio = dangerousMembers / n;
  let penaltyFactor = 1.0;
  
  if (dangerRatio > 0.3) {
    // 超过30%成员危险信号得分过低，触发惩罚
    penaltyFactor = 1 - (dangerRatio - 0.3) * 0.5;
  }

  // 5. 最终团队分数
  const teamScore = baseScore * consistencyFactor * penaltyFactor;

  return {
    teamScore: Math.round(teamScore * 10) / 10,
    baseScore: Math.round(baseScore * 10) / 10,
    consistencyFactor: Math.round(consistencyFactor * 100) / 100,
    penaltyFactor: Math.round(penaltyFactor * 100) / 100,
    standardDeviation: Math.round(stdDev * 10) / 10,
  };
}

/**
 * 获取团队健康等级
 */
export function getTeamHealthGrade(score: number): string {
  if (score >= 80) return 'Exceptional Team';
  if (score >= 65) return 'Healthy Team';
  if (score >= 50) return 'Risk Team';
  return 'Error';
}
