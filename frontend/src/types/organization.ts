/**
 * 组织相关的 TypeScript 类型定义
 * 
 * 放置位置: frontend/src/types/organization.ts
 */

// ============================================
// 组织相关类型
// ============================================

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  
  // 统计信息（可选）
  assessmentCount?: number;
  completedAssessmentCount?: number;
  childrenCount?: number;
  
  // 子组织（树形结构）
  children?: Organization[];
  
  // 父组织（可选）
  parent?: Organization;
}

export interface OrganizationStats {
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  totalParticipants: number;
  completedParticipants: number;
  childrenCount: number;
  hasLatestReport: boolean;
}

export interface OrganizationFormData {
  name: string;
  description?: string;
  parentId?: string | null;
  leaderName: string;
  leaderEmail: string;
  leaderPhone?: string;
  createdBy?: string;
}

export interface OrganizationTreeNode extends Organization {
  children: OrganizationTreeNode[];
  level?: number; // 层级深度
  isExpanded?: boolean; // 是否展开
}

// ============================================
// 汇总报告相关类型
// ============================================

export interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
}

export interface TeamComparison {
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

export interface TopPerformer {
  teamName: string;
  score: number;
  standoutDimensions?: string[];
}

export interface TeamNeedsAttention {
  teamName: string;
  score: number;
  issues: string[];
}

export interface Insights {
  summary: string;
  strengths: string[];
  concerns: string[];
  topPerformer: TopPerformer;
  needsAttention: TeamNeedsAttention[];
  recommendations: string[];
  crossTeamTrends?: string[];
}

export interface SummaryReportData {
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

export interface SummaryReportMeta {
  createdAt: string;
  updatedAt: string;
  generatedBy: string;
  emailSent: boolean;
  emailSentAt: string | null;
  organization?: Organization;
}

export interface SummaryReportResponse {
  success: boolean;
  data: SummaryReportData;
  meta: SummaryReportMeta;
}

export interface SummaryReportStatus {
  canGenerate: boolean;
  hasExistingReport: boolean;
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  completionRate: number;
  lastReportDate: string | null;
  recommendation: string;
}

// ============================================
// API 响应类型
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface OrganizationsResponse {
  success: boolean;
  data: Organization[];
  format: 'tree' | 'flat';
}

export interface OrganizationDetailResponse {
  success: boolean;
  data: Organization & {
    stats: OrganizationStats;
  };
}

export interface GenerateSummaryResponse {
  success: boolean;
  data: SummaryReportData;
  message: string;
  meta: {
    organizationName: string;
    completedTeams: number;
    totalTeams: number;
  };
}

// ============================================
// 维度名称映射
// ============================================

export const DIMENSION_NAMES: Record<keyof DimensionScores, string> = {
  teamConnection: '团队连接性',
  appreciation: '欣赏认可',
  responsiveness: '响应及时性',
  trustPositivity: '信任与积极性',
  conflictManagement: '冲突管理',
  goalSupport: '目标支持',
};

export const DIMENSION_NAMES_EN: Record<keyof DimensionScores, string> = {
  teamConnection: 'Team Connection',
  appreciation: 'Appreciation',
  responsiveness: 'Responsiveness',
  trustPositivity: 'Trust & Positivity',
  conflictManagement: 'Conflict Management',
  goalSupport: 'Goal Support',
};

// ============================================
// 健康等级相关
// ============================================

export type HealthGrade = 'Exceptional' | 'Strong' | 'Developing' | 'Needs Attention';

export const HEALTH_GRADE_CONFIG: Record<
  HealthGrade,
  {
    label: string;
    color: string;
    bgColor: string;
    minScore: number;
  }
> = {
  Exceptional: {
    label: '卓越',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    minScore: 90,
  },
  Strong: {
    label: '优秀',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    minScore: 75,
  },
  Developing: {
    label: '良好',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    minScore: 50,
  },
  'Needs Attention': {
    label: '需要关注',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    minScore: 0,
  },
};

// ============================================
// 辅助函数
// ============================================

/**
 * 根据分数获取健康等级
 */
export function getHealthGrade(score: number): HealthGrade {
  if (score >= 90) return 'Exceptional';
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Developing';
  return 'Needs Attention';
}

/**
 * 获取健康等级配置
 */
export function getHealthGradeConfig(score: number) {
  const grade = getHealthGrade(score);
  return HEALTH_GRADE_CONFIG[grade];
}

/**
 * 获取分数颜色类名
 */
export function getScoreColorClass(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * 获取分数背景颜色类名
 */
export function getScoreBgColorClass(score: number): string {
  if (score >= 90) return 'bg-green-50';
  if (score >= 75) return 'bg-blue-50';
  if (score >= 50) return 'bg-yellow-50';
  return 'bg-red-50';
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 计算完成率百分比
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}