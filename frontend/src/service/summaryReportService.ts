/**
 * 汇总报告 API 服务（前端）
 * 
 * 放置位置: frontend/src/services/summaryReportService.ts
 */

import {
  SummaryReportData,
  SummaryReportResponse,
  SummaryReportStatus,
  ApiResponse,
} from '../types/organization';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// 辅助函数
// ============================================

/**
 * 处理 API 响应错误
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.error || error.message || 'API 请求失败');
  }
  return response.json();
}

// ============================================
// 汇总报告 API
// ============================================

/**
 * 检查汇总报告状态
 * @param organizationId - 组织 ID
 */
export async function checkSummaryReportStatus(
  organizationId: string
): Promise<SummaryReportStatus> {
  const response = await fetch(
    `${API_BASE_URL}/admin/organizations/${organizationId}/summary/status`
  );
  const data = await handleResponse<ApiResponse<SummaryReportStatus>>(response);
  
  if (!data.data) {
    throw new Error('获取报告状态失败');
  }
  
  return data.data;
}

/**
 * 生成汇总报告
 * @param organizationId - 组织 ID
 * @param generatedBy - 生成者
 */
export async function generateSummaryReport(
  organizationId: string,
  generatedBy: string = 'admin'
): Promise<SummaryReportData> {
  const response = await fetch(
    `${API_BASE_URL}/admin/organizations/${organizationId}/generate-summary`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ generatedBy }),
    }
  );

  const data = await handleResponse<ApiResponse<SummaryReportData>>(response);
  
  if (!data.data) {
    throw new Error('生成汇总报告失败');
  }
  
  return data.data;
}

/**
 * 获取汇总报告
 * @param organizationId - 组织 ID
 * @param includeOrganization - 是否包含组织信息
 */
export async function getSummaryReport(
  organizationId: string,
  includeOrganization: boolean = true
): Promise<SummaryReportResponse> {
  const params = new URLSearchParams({
    includeOrganization: includeOrganization.toString(),
  });

  const response = await fetch(
    `${API_BASE_URL}/admin/organizations/${organizationId}/summary?${params}`
  );
  
  return handleResponse<SummaryReportResponse>(response);
}

/**
 * 发送汇总报告邮件
 * @param organizationId - 组织 ID
 * @param additionalRecipients - 额外的收件人邮箱列表
 */
export async function sendSummaryReportEmail(
  organizationId: string,
  additionalRecipients: string[] = []
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/admin/organizations/${organizationId}/send-summary-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ additionalRecipients }),
    }
  );

  await handleResponse<ApiResponse<void>>(response);
}

/**
 * 删除汇总报告
 * @param organizationId - 组织 ID
 */
export async function deleteSummaryReport(organizationId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/admin/organizations/${organizationId}/summary`,
    {
      method: 'DELETE',
    }
  );

  await handleResponse<ApiResponse<void>>(response);
}

// ============================================
// 辅助函数：数据处理
// ============================================

/**
 * 计算完成率
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * 格式化分数（保留一位小数）
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/**
 * 获取健康等级的中文
 */
export function getHealthGradeLabel(grade: string): string {
  const gradeMap: Record<string, string> = {
    Exceptional: '卓越',
    Strong: '优秀',
    Developing: '良好',
    'Needs Attention': '需要关注',
  };
  return gradeMap[grade] || grade;
}

/**
 * 导出数据为 CSV
 */
export function exportToCSV(data: SummaryReportData, organizationName: string): void {
  // CSV 表头
  const headers = [
    '排名',
    '团队名称',
    '团队分数',
    '健康等级',
    '参与人数',
    '总人数',
    '参与率',
    '团队连接性',
    '欣赏认可',
    '响应及时性',
    '信任与积极性',
    '冲突管理',
    '目标支持',
  ];

  // CSV 数据行
  const rows = data.teamComparisons.map((team, index) => [
    index + 1,
    team.teamName,
    team.teamScore.toFixed(1),
    getHealthGradeLabel(team.healthGrade),
    team.participationCount,
    team.totalMembers,
    `${(team.participationRate * 100).toFixed(0)}%`,
    team.dimensionScores.teamConnection.toFixed(1),
    team.dimensionScores.appreciation.toFixed(1),
    team.dimensionScores.responsiveness.toFixed(1),
    team.dimensionScores.trustPositivity.toFixed(1),
    team.dimensionScores.conflictManagement.toFixed(1),
    team.dimensionScores.goalSupport.toFixed(1),
  ]);

  // 构建 CSV 内容
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // 添加 BOM 以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 下载文件
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${organizationName}_汇总报告_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 导出数据为 JSON
 */
export function exportToJSON(data: SummaryReportData, organizationName: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${organizationName}_汇总报告_${new Date().toISOString().slice(0, 10)}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 打印报告
 */
export function printReport(): void {
  window.print();
}

export default {
  checkSummaryReportStatus,
  generateSummaryReport,
  getSummaryReport,
  sendSummaryReportEmail,
  deleteSummaryReport,
  calculateCompletionRate,
  formatScore,
  getHealthGradeLabel,
  exportToCSV,
  exportToJSON,
  printReport,
};
