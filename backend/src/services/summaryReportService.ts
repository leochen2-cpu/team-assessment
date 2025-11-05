/**
 * 汇总报告生成服务
 * 
 * 负责生成组织的汇总报告，包括：
 * - 跨团队的统计分析
 * - 维度对比
 * - 智能洞察生成
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 类型定义
// ============================================

interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
}

interface TeamComparison {
  assessmentId: string;
  teamName: string;
  teamScore: number;
  healthGrade: string;
  participationRate: number;
  participationCount: number;
  totalMembers: number;
  completedAt: string;
  dimensionScores: DimensionScores;
  warningSignsAverage?: number;
}

interface Insights {
  summary: string;
  strengths: string[];
  concerns: string[];
  topPerformer: {
    teamName: string;
    score: number;
    standoutDimensions?: string[];
  };
  needsAttention: Array<{
    teamName: string;
    score: number;
    issues: string[];
  }>;
  recommendations: string[];
  crossTeamTrends?: string[];
}

interface SummaryReportData {
  totalTeams: number;
  completedTeams: number;
  pendingTeams: number;
  averageTeamScore: number;
  highestScore: number;
  lowestScore: number;
  scoreStdDev: number;
  dimensionAverages: DimensionScores;
  teamComparisons: TeamComparison[];
  insights: Insights;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 计算标准差
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * 获取健康等级
 */
function getHealthGrade(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Developing';
  return 'Needs Attention';
}

/**
 * 获取维度的中文名称
 */
function getDimensionNameChinese(key: string): string {
  const names: Record<string, string> = {
    teamConnection: '团队连接性',
    appreciation: '欣赏认可',
    responsiveness: '响应及时性',
    trustPositivity: '信任与积极性',
    conflictManagement: '冲突管理',
    goalSupport: '目标支持',
  };
  return names[key] || key;
}

/**
 * 计算维度平均值
 */
function calculateDimensionAverages(
  assessments: any[]
): DimensionScores {
  const dimensions: DimensionScores = {
    teamConnection: 0,
    appreciation: 0,
    responsiveness: 0,
    trustPositivity: 0,
    conflictManagement: 0,
    goalSupport: 0,
  };

  if (assessments.length === 0) return dimensions;

  // 累加所有团队的维度分数
  assessments.forEach((assessment) => {
    if (assessment.teamReport?.dimensionScores) {
      const scores = JSON.parse(assessment.teamReport.dimensionScores);
      Object.keys(dimensions).forEach((key) => {
        dimensions[key as keyof DimensionScores] += scores[key] || 0;
      });
    }
  });

  // 计算平均值
  Object.keys(dimensions).forEach((key) => {
    dimensions[key as keyof DimensionScores] =
      parseFloat((dimensions[key as keyof DimensionScores] / assessments.length).toFixed(2));
  });

  return dimensions;
}

/**
 * 生成智能洞察
 */
function generateInsights(
  teamComparisons: TeamComparison[],
  dimensionAverages: DimensionScores,
  averageScore: number
): Insights {
  const insights: Insights = {
    summary: '',
    strengths: [],
    concerns: [],
    topPerformer: { teamName: '', score: 0 },
    needsAttention: [],
    recommendations: [],
    crossTeamTrends: [],
  };

  if (teamComparisons.length === 0) {
    insights.summary = '暂无已完成的评估数据';
    return insights;
  }

  // 1. 生成概要
  const gradeDistribution = {
    exceptional: teamComparisons.filter((t) => t.teamScore >= 90).length,
    strong: teamComparisons.filter((t) => t.teamScore >= 75 && t.teamScore < 90).length,
    developing: teamComparisons.filter((t) => t.teamScore >= 50 && t.teamScore < 75).length,
    needsAttention: teamComparisons.filter((t) => t.teamScore < 50).length,
  };

  const overallGrade = getHealthGrade(averageScore);
  insights.summary = `整体表现${overallGrade === 'Exceptional' ? '卓越' : overallGrade === 'Strong' ? '优秀' : overallGrade === 'Developing' ? '良好' : '需要关注'}，平均分数 ${averageScore.toFixed(1)}。`;

  if (gradeDistribution.exceptional > 0) {
    insights.summary += ` 有 ${gradeDistribution.exceptional} 个团队表现卓越。`;
  }

  // 2. 识别优势
  const dimensionEntries = Object.entries(dimensionAverages).sort(
    ([, a], [, b]) => b - a
  );

  // 找出前2个最高的维度
  dimensionEntries.slice(0, 2).forEach(([key, value]) => {
    if (value >= 80) {
      insights.strengths.push(
        `${getDimensionNameChinese(key)}表现突出（平均 ${value.toFixed(1)} 分）`
      );
    }
  });

  // 高参与率
  const avgParticipation =
    teamComparisons.reduce((sum, t) => sum + t.participationRate, 0) /
    teamComparisons.length;
  if (avgParticipation >= 0.9) {
    insights.strengths.push(
      `评估参与率高（平均 ${(avgParticipation * 100).toFixed(0)}%）`
    );
  }

  // 一致性好
  const scores = teamComparisons.map((t) => t.teamScore);
  const stdDev = calculateStandardDeviation(scores);
  if (stdDev < 8) {
    insights.strengths.push('团队表现一致性良好');
  }

  // 3. 识别关注点
  // 找出最低的2个维度
  dimensionEntries.slice(-2).forEach(([key, value]) => {
    if (value < 75) {
      insights.concerns.push(
        `${getDimensionNameChinese(key)}有待提升（平均 ${value.toFixed(1)} 分）`
      );
    }
  });

  // 低参与率团队
  const lowParticipationTeams = teamComparisons.filter(
    (t) => t.participationRate < 0.85
  );
  if (lowParticipationTeams.length > 0) {
    insights.concerns.push(
      `${lowParticipationTeams.length} 个团队参与率偏低（<85%）`
    );
  }

  // 团队间差异大
  if (stdDev > 12) {
    insights.concerns.push('团队间表现差异较大，需关注一致性');
  }

  // 4. 识别最佳表现者
  const topTeam = teamComparisons.reduce((prev, current) =>
    prev.teamScore > current.teamScore ? prev : current
  );

  insights.topPerformer = {
    teamName: topTeam.teamName,
    score: topTeam.teamScore,
  };

  // 找出该团队的突出维度
  const topTeamDimensions = Object.entries(topTeam.dimensionScores)
    .filter(([, score]) => score >= 85)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => getDimensionNameChinese(key));

  if (topTeamDimensions.length > 0) {
    insights.topPerformer.standoutDimensions = topTeamDimensions;
  }

  // 5. 识别需要关注的团队
  const bottomTeams = teamComparisons
    .filter((t) => t.teamScore < 75)
    .sort((a, b) => a.teamScore - b.teamScore)
    .slice(0, 3); // 最多列出3个

  bottomTeams.forEach((team) => {
    const issues: string[] = [];

    // 分析具体问题
    Object.entries(team.dimensionScores).forEach(([key, score]) => {
      if (score < 70) {
        issues.push(`${getDimensionNameChinese(key)}偏低（${score.toFixed(1)}分）`);
      }
    });

    if (team.participationRate < 0.85) {
      issues.push(`参与率低（${(team.participationRate * 100).toFixed(0)}%）`);
    }

    if (team.warningSignsAverage && team.warningSignsAverage > 25) {
      issues.push('警告信号较高');
    }

    insights.needsAttention.push({
      teamName: team.teamName,
      score: team.teamScore,
      issues: issues.slice(0, 3), // 最多列3个问题
    });
  });

  // 6. 生成建议
  // 基于最薄弱的维度
  const weakestDimension = dimensionEntries[dimensionEntries.length - 1];
  if (weakestDimension[1] < 75) {
    insights.recommendations.push(
      `组织${getDimensionNameChinese(weakestDimension[0])}培训或研讨会`
    );
  }

  // 基于最佳团队
  if (topTeam.teamScore >= 85) {
    insights.recommendations.push(
      `分享 ${topTeam.teamName} 的最佳实践给其他团队`
    );
  }

  // 基于需要关注的团队
  if (insights.needsAttention.length > 0) {
    insights.recommendations.push(
      `为表现较弱的团队提供针对性支持和指导`
    );
  }

  // 基于参与率
  if (avgParticipation < 0.9) {
    insights.recommendations.push('提高评估参与率，确保数据全面性');
  }

  // 基于一致性
  if (stdDev > 12) {
    insights.recommendations.push('分析团队间差异原因，促进跨团队学习');
  }

  // 7. 跨团队趋势
  // 找出普遍的强项
  const strongDimensions = dimensionEntries
    .filter(([, score]) => score >= 80)
    .map(([key]) => getDimensionNameChinese(key));

  if (strongDimensions.length > 0) {
    insights.crossTeamTrends?.push(
      `所有团队在${strongDimensions.join('、')}方面表现良好`
    );
  }

  // 找出普遍的弱项
  const weakDimensions = dimensionEntries
    .filter(([, score]) => score < 75)
    .map(([key]) => getDimensionNameChinese(key));

  if (weakDimensions.length > 0) {
    insights.crossTeamTrends?.push(
      `${weakDimensions.join('、')}是跨团队的共同成长领域`
    );
  }

  // 分数与信任度的关系
  const highTrustTeams = teamComparisons.filter(
    (t) => t.dimensionScores.trustPositivity >= 85
  );
  if (highTrustTeams.length > teamComparisons.length / 2) {
    const avgHighTrustScore =
      highTrustTeams.reduce((sum, t) => sum + t.teamScore, 0) /
      highTrustTeams.length;
    if (avgHighTrustScore > averageScore + 5) {
      insights.crossTeamTrends?.push(
        '信任度高的团队往往整体表现更好'
      );
    }
  }

  return insights;
}

// ============================================
// 主要函数：生成汇总报告
// ============================================

/**
 * 为组织生成汇总报告
 */
export async function generateSummaryReport(
  organizationId: string,
  generatedBy: string = 'admin'
): Promise<SummaryReportData> {
  try {
    // 1. 获取组织信息
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        assessments: {
          include: {
            teamReport: true,
            codes: {
              where: {
                isUsed: true,
              },
            },
            _count: {
              select: {
                codes: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new Error('组织不存在');
    }

    // 2. 筛选已完成的评估
    const completedAssessments = organization.assessments.filter(
      (a) => a.teamReport !== null
    );

    if (completedAssessments.length === 0) {
      throw new Error('该组织下没有已完成的评估');
    }

    const totalTeams = organization.assessments.length;
    const completedTeams = completedAssessments.length;
    const pendingTeams = totalTeams - completedTeams;

    // 3. 计算团队分数统计
    const teamScores = completedAssessments.map(
      (a) => a.teamReport!.teamScore
    );
    const averageTeamScore = parseFloat(
      (teamScores.reduce((sum, score) => sum + score, 0) / teamScores.length).toFixed(2)
    );
    const highestScore = Math.max(...teamScores);
    const lowestScore = Math.min(...teamScores);
    const scoreStdDev = parseFloat(calculateStandardDeviation(teamScores).toFixed(2));

    // 4. 计算维度平均值
    const dimensionAverages = calculateDimensionAverages(completedAssessments);

    // 5. 构建团队对比数据
    const teamComparisons: TeamComparison[] = completedAssessments.map((assessment) => {
      const teamReport = assessment.teamReport!;
      const dimensionScores = JSON.parse(teamReport.dimensionScores);
      const participationCount = assessment.codes.length;
      const participationRate = participationCount / assessment.memberCount;

      // 计算警告信号平均值（如果有）
      let warningSignsAverage: number | undefined;
      try {
        const responses = assessment.codes
          .filter((c) => c.responses)
          .map((c) => JSON.parse(c.responses!));

        if (responses.length > 0) {
          const warningQuestions = [25, 26, 27]; // 假设警告信号是问题 25-27
          const warningScores = responses.map((resp) =>
            warningQuestions.reduce((sum, q) => sum + (resp[q] || 0), 0)
          );
          warningSignsAverage =
            warningScores.reduce((sum, s) => sum + s, 0) / warningScores.length;
        }
      } catch (error) {
        console.warn('计算警告信号失败:', error);
      }

      return {
        assessmentId: assessment.id,
        teamName: assessment.teamName,
        teamScore: teamReport.teamScore,
        healthGrade: getHealthGrade(teamReport.teamScore),
        participationRate: parseFloat(participationRate.toFixed(2)),
        participationCount,
        totalMembers: assessment.memberCount,
        completedAt: teamReport.createdAt.toISOString(),
        dimensionScores,
        ...(warningSignsAverage && { warningSignsAverage }),
      };
    });

    // 按分数排序
    teamComparisons.sort((a, b) => b.teamScore - a.teamScore);

    // 6. 生成智能洞察
    const insights = generateInsights(
      teamComparisons,
      dimensionAverages,
      averageTeamScore
    );

    // 7. 构建汇总报告数据
    const reportData: SummaryReportData = {
      totalTeams,
      completedTeams,
      pendingTeams,
      averageTeamScore,
      highestScore,
      lowestScore,
      scoreStdDev,
      dimensionAverages,
      teamComparisons,
      insights,
    };

    // 8. 保存或更新汇总报告到数据库
    const existingReport = await prisma.summaryReport.findUnique({
      where: { organizationId },
    });

    if (existingReport) {
      // 更新现有报告
      await prisma.summaryReport.update({
        where: { organizationId },
        data: {
          leaderName: organization.leaderName,
          leaderEmail: organization.leaderEmail,
          totalTeams,
          completedTeams,
          pendingTeams,
          averageTeamScore,
          highestScore,
          lowestScore,
          scoreStdDev,
          dimensionAverages: JSON.stringify(dimensionAverages),
          teamComparisons: JSON.stringify(teamComparisons),
          insights: JSON.stringify(insights),
          generatedBy,
          emailSent: false, // 重新生成后重置邮件发送状态
        },
      });
    } else {
      // 创建新报告
      await prisma.summaryReport.create({
        data: {
          organizationId,
          leaderName: organization.leaderName,
          leaderEmail: organization.leaderEmail,
          totalTeams,
          completedTeams,
          pendingTeams,
          averageTeamScore,
          highestScore,
          lowestScore,
          scoreStdDev,
          dimensionAverages: JSON.stringify(dimensionAverages),
          teamComparisons: JSON.stringify(teamComparisons),
          insights: JSON.stringify(insights),
          generatedBy,
        },
      });
    }

    return reportData;
  } catch (error) {
    console.error('生成汇总报告失败:', error);
    throw error;
  }
}

/**
 * 获取组织的汇总报告
 */
export async function getSummaryReport(
  organizationId: string
): Promise<SummaryReportData | null> {
  try {
    const report = await prisma.summaryReport.findUnique({
      where: { organizationId },
    });

    if (!report) {
      return null;
    }

    return {
      totalTeams: report.totalTeams,
      completedTeams: report.completedTeams,
      pendingTeams: report.pendingTeams,
      averageTeamScore: report.averageTeamScore,
      highestScore: report.highestScore,
      lowestScore: report.lowestScore,
      scoreStdDev: report.scoreStdDev,
      dimensionAverages: JSON.parse(report.dimensionAverages),
      teamComparisons: JSON.parse(report.teamComparisons),
      insights: JSON.parse(report.insights),
    };
  } catch (error) {
    console.error('获取汇总报告失败:', error);
    throw error;
  }
}

export default {
  generateSummaryReport,
  getSummaryReport,
};
