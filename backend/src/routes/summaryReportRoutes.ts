/**
 * 汇总报告路由
 * 
 * 提供汇总报告的生成、查询和邮件发送功能
 * 路径: /api/admin/organizations/:id/summary
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateSummaryReport, getSummaryReport } from '../services/summaryReportService';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// POST /api/admin/organizations/:id/generate-summary
// 生成汇总报告
// ============================================
router.post('/:id/generate-summary', async (req: Request, res: Response) => {
  try {
    const { id: organizationId } = req.params;
    const { generatedBy = 'admin' } = req.body;

    // 验证组织是否存在
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        assessments: {
          include: {
            teamReport: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: '组织不存在',
      });
    }

    // 检查是否有已完成的评估
    const completedAssessments = organization.assessments.filter(
      (a) => a.teamReport !== null
    );

    if (completedAssessments.length === 0) {
      return res.status(400).json({
        success: false,
        message: '该组织下没有已完成的评估，无法生成汇总报告',
        hint: '请确保至少有一个团队完成了评估',
      });
    }

    // 生成汇总报告
    const reportData = await generateSummaryReport(organizationId, generatedBy);

    res.status(201).json({
      success: true,
      message: '汇总报告生成成功',
      data: reportData,
      meta: {
        organizationName: organization.name,
        completedTeams: completedAssessments.length,
        totalTeams: organization.assessments.length,
      },
    });
  } catch (error) {
    console.error('生成汇总报告失败:', error);
    res.status(500).json({
      success: false,
      message: '生成汇总报告失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// GET /api/admin/organizations/:id/summary
// 获取汇总报告
// ============================================
router.get('/:id/summary', async (req: Request, res: Response) => {
  try {
    const { id: organizationId } = req.params;
    const { includeOrganization = 'true' } = req.query;

    // 获取汇总报告
    const reportData = await getSummaryReport(organizationId);

    if (!reportData) {
      return res.status(404).json({
        success: false,
        message: '汇总报告不存在',
        hint: '请先生成汇总报告',
      });
    }

    // 获取报告元数据
    const report = await prisma.summaryReport.findUnique({
      where: { organizationId },
      include: {
        organization: includeOrganization === 'true',
      },
    });

    res.json({
      success: true,
      data: reportData,
      meta: {
        createdAt: report?.createdAt,
        updatedAt: report?.updatedAt,
        generatedBy: report?.generatedBy,
        emailSent: report?.emailSent,
        emailSentAt: report?.emailSentAt,
        organization: report?.organization,
      },
    });
  } catch (error) {
    console.error('获取汇总报告失败:', error);
    res.status(500).json({
      success: false,
      message: '获取汇总报告失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// POST /api/admin/organizations/:id/send-summary-email
// 发送汇总报告邮件
// ============================================
router.post('/:id/send-summary-email', async (req: Request, res: Response) => {
  try {
    const { id: organizationId } = req.params;
    const { additionalRecipients = [] } = req.body;

    // 获取组织和汇总报告
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: '组织不存在',
      });
    }

    const reportData = await getSummaryReport(organizationId);

    if (!reportData) {
      return res.status(404).json({
        success: false,
        message: '汇总报告不存在，请先生成报告',
      });
    }

    // TODO: 这里应该调用邮件服务发送邮件
    // 由于邮件服务的实现取决于你现有的 emailService.ts，
    // 我会在后面提供一个邮件模板函数

    // 暂时模拟发送成功
    const recipients = [organization.leaderEmail, ...additionalRecipients];

    // 更新报告的邮件发送状态
    await prisma.summaryReport.update({
      where: { organizationId },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: '汇总报告邮件发送成功',
      data: {
        recipients,
        organizationName: organization.name,
        leaderName: organization.leaderName,
      },
    });
  } catch (error) {
    console.error('发送汇总报告邮件失败:', error);
    res.status(500).json({
      success: false,
      message: '发送汇总报告邮件失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
});

// ============================================
// GET /api/admin/organizations/:id/summary/status
// 检查是否可以生成汇总报告
// ============================================
router.get('/:id/summary/status', async (req: Request, res: Response) => {
  try {
    const { id: organizationId } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        assessments: {
          include: {
            teamReport: true,
          },
        },
        summaryReports: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: '组织不存在',
      });
    }

    const totalAssessments = organization.assessments.length;
    const completedAssessments = organization.assessments.filter(
      (a) => a.teamReport !== null
    ).length;
    const pendingAssessments = totalAssessments - completedAssessments;

    const canGenerate = completedAssessments > 0;
    const hasExistingReport = organization.summaryReports.length > 0;

    const status = {
      canGenerate,
      hasExistingReport,
      totalAssessments,
      completedAssessments,
      pendingAssessments,
      completionRate:
        totalAssessments > 0
          ? parseFloat((completedAssessments / totalAssessments).toFixed(2))
          : 0,
      lastReportDate: hasExistingReport
        ? organization.summaryReports[0].updatedAt
        : null,
      recommendation: canGenerate
        ? hasExistingReport
          ? 'The summary report can be regenerated.'
          : 'Summary reports can be generated.'
        : 'Please wait for at least one team to complete the evaluation.',
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Failed to check summary report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check summary report status',
      error: error instanceof Error ? error.message : 'Unknown Error',
    });
  }
});

// ============================================
// DELETE /api/admin/organizations/:id/summary
// 删除汇总报告
// ============================================
router.delete('/:id/summary', async (req: Request, res: Response) => {
  try {
    const { id: organizationId } = req.params;

    const report = await prisma.summaryReport.findUnique({
      where: { organizationId },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Summary report does not exist',
      });
    }

    await prisma.summaryReport.delete({
      where: { organizationId },
    });

    res.json({
      success: true,
      message: 'The summary report has been deleted.',
    });
  } catch (error) {
    console.error('Deleting summary report failed:', error);
    res.status(500).json({
      success: false,
      message: 'Deleting summary report failed',
      error: error instanceof Error ? error.message : 'Unknown Error',
    });
  }
});

export default router;
