/**
 * 汇总报告页面
 * 
 * 放置位置: frontend/src/pages/OrganizationSummaryPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SummaryReportData,
  SummaryReportStatus,
  Organization,
} from '../types/organization';
import {
  getSummaryReport,
  generateSummaryReport,
  checkSummaryReportStatus,
  sendSummaryReportEmail,
  exportToCSV,
  exportToJSON,
  printReport,
} from '../service/summaryReportService';
import { getOrganizationById } from '../service/organizationService';
import { SummaryStats } from '../components/SummaryStats';
import { DimensionChart, TeamComparisonChart } from '../components/DimensionChart';
import { TeamComparisonTable } from '../components/TeamComparisonTable';
import { InsightsPanel } from '../components/InsightsPanel';
import { Breadcrumb } from '../components/Breadcrumb';

/**
 * 汇总报告页面
 */
export const OrganizationSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [reportData, setReportData] = useState<SummaryReportData | null>(null);
  const [status, setStatus] = useState<SummaryReportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载组织信息和报告状态
  const fetchData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // 并行加载组织信息和报告状态
      const [orgData, statusData] = await Promise.all([
        getOrganizationById(id, true, true),
        checkSummaryReportStatus(id),
      ]);

      setOrganization(orgData);
      setStatus(statusData);

      // 如果有现有报告，加载报告数据
      if (statusData.hasExistingReport) {
        const report = await getSummaryReport(id);
        setReportData(report.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载失败';
      setError(errorMessage);
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 生成报告
  const handleGenerateReport = async () => {
    if (!id) return;

    try {
      setIsGenerating(true);
      setError(null);
      
      const newReport = await generateSummaryReport(id, 'admin');
      setReportData(newReport);
      
      // 刷新状态
      const newStatus = await checkSummaryReportStatus(id);
      setStatus(newStatus);
      
      alert('报告生成成功！');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成报告失败';
      setError(errorMessage);
      alert(`错误：${errorMessage}`);
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 发送邮件
  const handleSendEmail = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      `确定要发送汇总报告邮件给 ${organization?.leaderName} (${organization?.leaderEmail}) 吗？`
    );

    if (!confirmed) return;

    try {
      setIsSendingEmail(true);
      await sendSummaryReportEmail(id, []);
      alert('邮件发送成功！');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送邮件失败';
      alert(`错误：${errorMessage}`);
      console.error('Failed to send email:', err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 导出数据
  const handleExport = (format: 'csv' | 'json') => {
    if (!reportData || !organization) return;

    if (format === 'csv') {
      exportToCSV(reportData, organization.name);
    } else {
      exportToJSON(reportData, organization.name);
    }
  };

  // 查看团队详情
  const handleViewTeamDetail = (assessmentId: string) => {
    navigate(`/admin/assessment/${assessmentId}/report`);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 面包屑导航
  const breadcrumbItems = [
    { label: '组织管理', path: '/admin/organizations', icon: '🏢' },
    { label: organization?.name || '加载中...', path: `/admin/organization/${id}` },
    { label: '汇总报告' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbItems} />

        {/* 页面标题和操作栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organization?.name} - 汇总报告
            </h1>
            <p className="mt-2 text-gray-600">
              组织负责人: {organization?.leaderName}
            </p>
          </div>

          {/* 操作按钮组 */}
          <div className="flex items-center gap-3">
            {reportData && (
              <>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  导出 CSV
                </button>
                <button
                  onClick={printReport}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  打印
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      发送中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      发送邮件
                    </>
                  )}
                </button>
              </>
            )}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {reportData ? '重新生成' : '生成报告'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* 报告状态提示 */}
        {status && !reportData && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">报告状态</h3>
                <p className="text-gray-700 mb-3">{status.recommendation}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">总评估数:</span>
                    <span className="ml-2 font-semibold">{status.totalAssessments}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">已完成:</span>
                    <span className="ml-2 font-semibold">{status.completedAssessments}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">完成率:</span>
                    <span className="ml-2 font-semibold">{status.completionRate}%</span>
                  </div>
                </div>
                {!status.canGenerate && (
                  <p className="mt-3 text-red-600 text-sm">
                    ⚠️ 至少需要一个已完成的评估才能生成报告
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 报告内容 */}
        {reportData && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <SummaryStats
              averageScore={reportData.averageTeamScore}
              highestScore={reportData.highestScore}
              lowestScore={reportData.lowestScore}
              completedTeams={reportData.completedTeams}
              totalTeams={reportData.totalTeams}
              healthGrade={reportData.insights.topPerformer.score >= 90 ? 'Exceptional' : reportData.insights.topPerformer.score >= 75 ? 'Strong' : 'Developing'}
            />

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 维度对比柱状图 */}
              <DimensionChart
                dimensionAverages={reportData.dimensionAverages}
                type="bar"
                height={350}
              />

              {/* 团队分数对比图 */}
              <TeamComparisonChart
                teams={reportData.teamComparisons.map((t) => ({
                  teamName: t.teamName,
                  teamScore: t.teamScore,
                }))}
                height={350}
              />
            </div>

            {/* 团队对比表格 */}
            <TeamComparisonTable
              teams={reportData.teamComparisons}
              onTeamClick={handleViewTeamDetail}
            />

            {/* 洞察面板 */}
            <InsightsPanel insights={reportData.insights} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSummaryPage;