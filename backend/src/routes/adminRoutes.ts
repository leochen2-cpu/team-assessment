import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
  calculateDimensionScores,
  calculatePersonalScore,
  calculateTeamScore,
  getTeamHealthGrade,
} from '../services/scoreCalculation';
import { sendBatchPersonalReports } from '../services/emailService';

const router = express.Router();
const prisma = new PrismaClient();

// 管理员密码（从环境变量读取）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 生成8位随机Unique Code
function generateUniqueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/admin/login
 * 管理员登录
 */
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
      res.json({
        success: true,
        message: 'Login successful',
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid password',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: 'Login failed',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/assessments
 * 创建新的评估活动并生成unique codes
 */
router.post('/assessments', async (req, res) => {
  try {
    const { teamName, memberCount, createdBy } = req.body;

    if (!teamName || !memberCount || !createdBy) {
      return res.status(400).json({
        error: 'teamName, memberCount, and createdBy are required',
      });
    }

    if (memberCount < 1 || memberCount > 100) {
      return res.status(400).json({
        error: 'memberCount must be between 1 and 100',
      });
    }

    // 创建评估
    const assessment = await prisma.assessment.create({
      data: {
        teamName,
        memberCount,
        createdBy,
        status: 'ACTIVE',
      },
    });

    // 生成唯一的codes
    const codes: string[] = [];
    for (let i = 0; i < memberCount; i++) {
      let code = generateUniqueCode();
      let existing = await prisma.participantCode.findUnique({
        where: { code },
      });

      while (existing) {
        code = generateUniqueCode();
        existing = await prisma.participantCode.findUnique({
          where: { code },
        });
      }

      codes.push(code);

      // 创建参与者code记录
      await prisma.participantCode.create({
        data: {
          code,
          assessmentId: assessment.id,
        },
      });
    }

    res.json({
      success: true,
      assessment: {
        id: assessment.id,
        teamName: assessment.teamName,
        memberCount: assessment.memberCount,
        createdAt: assessment.createdAt,
        codes: codes,
      },
    });
  } catch (error: any) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      error: 'Failed to create assessment',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/assessments/:id
 * 获取评估详情和所有codes的提交状态
 */
router.get('/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        codes: {
          select: {
            id: true,
            code: true,
            isUsed: true,
            name: true,
            email: true,
            submittedAt: true,
            emailSent: true,
          },
        },
        teamReport: true,
      },
    });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found',
      });
    }

    const submittedCount = assessment.codes.filter(c => c.isUsed).length;

    res.json({
      success: true,
      assessment: {
        id: assessment.id,
        teamName: assessment.teamName,
        memberCount: assessment.memberCount,
        status: assessment.status,
        createdAt: assessment.createdAt,
        createdBy: assessment.createdBy,
        submittedCount,
        codes: assessment.codes,
        teamReport: assessment.teamReport,
      },
    });
  } catch (error: any) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      error: 'Failed to get assessment',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/assessments/:id/calculate
 * 手动计算团队报告
 */
router.post('/assessments/:id/calculate', async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        codes: true,
      },
    });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found',
      });
    }

    const submittedCodes = assessment.codes.filter(c => c.isUsed && c.responses);

    if (submittedCodes.length === 0) {
      return res.status(400).json({
        error: 'No submissions yet',
      });
    }

    // 计算所有人的分数
    const personalScores: number[] = [];
    const warningSignsScores: number[] = [];
    const allDimensionScores: any[] = [];

    for (const code of submittedCodes) {
      const scoresData = JSON.parse(code.scores!);
      
      personalScores.push(scoresData.personalScore);
      warningSignsScores.push(scoresData.dimensionScores.warningSigns);
      allDimensionScores.push(scoresData.dimensionScores);
    }

    // 计算团队得分
    const teamScoreResult = calculateTeamScore(personalScores, warningSignsScores);

    // 计算团队平均维度分数
    const avgDimensions: any = {
      teamConnection: 0,
      appreciation: 0,
      responsiveness: 0,
      trustPositivity: 0,
      conflictManagement: 0,
      goalSupport: 0,
      warningSigns: 0,
    };

    for (const dims of allDimensionScores) {
      for (const key in avgDimensions) {
        avgDimensions[key] += dims[key];
      }
    }

    const count = allDimensionScores.length;
    for (const key in avgDimensions) {
      avgDimensions[key] = Math.round((avgDimensions[key] / count) * 10) / 10;
    }

    // 保存或更新团队报告
    const teamReport = await prisma.teamReport.upsert({
      where: { assessmentId: assessment.id },
      update: {
        teamScore: teamScoreResult.teamScore,
        baseScore: teamScoreResult.baseScore,
        consistencyFactor: teamScoreResult.consistencyFactor,
        penaltyFactor: teamScoreResult.penaltyFactor,
        standardDeviation: teamScoreResult.standardDeviation,
        dimensionScores: JSON.stringify(avgDimensions),
        participationCount: count,
      },
      create: {
        assessmentId: assessment.id,
        teamScore: teamScoreResult.teamScore,
        baseScore: teamScoreResult.baseScore,
        consistencyFactor: teamScoreResult.consistencyFactor,
        penaltyFactor: teamScoreResult.penaltyFactor,
        standardDeviation: teamScoreResult.standardDeviation,
        dimensionScores: JSON.stringify(avgDimensions),
        participationCount: count,
      },
    });

    res.json({
      success: true,
      teamReport: {
        ...teamReport,
        dimensionScores: avgDimensions,
        healthGrade: getTeamHealthGrade(teamReport.teamScore),
      },
    });
  } catch (error: any) {
    console.error('Calculate team report error:', error);
    res.status(500).json({
      error: 'Failed to calculate team report',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/assessments/:id/send-emails
 * 发送邮件给所有参与者（预留接口）
 */
router.post('/assessments/:id/send-emails', async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        codes: true,
        teamReport: true,
      },
    });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found',
      });
    }

    if (!assessment.teamReport) {
      return res.status(400).json({
        error: 'Team report not generated yet. Please calculate first.',
      });
    }

    const submittedCodes = assessment.codes.filter(c => c.isUsed);

    // TODO: 实现邮件发送逻辑
    res.json({
      success: true,
      message: 'Email sending feature coming soon',
      recipients: submittedCodes.length,
    });
  } catch (error: any) {
    console.error('Send emails error:', error);
    res.status(500).json({
      error: 'Failed to send emails',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/assessments
 * 获取所有评估列表
 */
router.get('/assessments', async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        codes: {
          select: {
            isUsed: true,
          },
        },
        teamReport: {
          select: {
            teamScore: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      assessments: assessments.map(a => ({
        id: a.id,
        teamName: a.teamName,
        memberCount: a.memberCount,
        status: a.status,
        createdAt: a.createdAt,
        submittedCount: a.codes.filter(c => c.isUsed).length,
        teamScore: a.teamReport?.teamScore,
      })),
    });
  } catch (error: any) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      error: 'Failed to get assessments',
      details: error.message,
    });
  }
});

router.post('/assessments/:id/send-emails', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取评估数据
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        codes: {
          where: { isUsed: true },
        },
        teamReport: true,
      },
    });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found',
      });
    }

    if (!assessment.teamReport) {
      return res.status(400).json({
        error: 'Team report not calculated yet. Please calculate first.',
      });
    }

    if (assessment.codes.length === 0) {
      return res.status(400).json({
        error: 'No participants have submitted yet.',
      });
    }

    // 准备团队报告摘要
    const teamSummary = {
      teamName: assessment.teamName,
      teamScore: assessment.teamReport.teamScore,
      teamGrade: getTeamHealthGrade(assessment.teamReport.teamScore),
      participationCount: assessment.teamReport.participationCount,
      reportUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/assessment/${id}/report`,
    };

    // 获取团队平均维度分数
    const teamDimensionAverages = JSON.parse(assessment.teamReport.dimensionScores);

    // 准备所有参与者的个人报告数据
    const personalReports = assessment.codes.map((code) => {
      const scores = JSON.parse(code.scores!);
      
      return {
        participantName: code.name!,
        participantEmail: code.email!,
        personalScore: scores.personalScore,
        teamAverageScore: assessment.teamReport!.teamScore,
        grade: scores.grade,
        dimensionScores: scores.dimensionScores,
        dimensionAverages: teamDimensionAverages,
        strengths: scores.strengths || [],
        growthAreas: scores.growthAreas || [],
        recommendations: scores.recommendations || [],
      };
    });

    // 批量发送邮件
    const result = await sendBatchPersonalReports(personalReports, teamSummary);

    if (result.success) {
      res.json({
        success: true,
        message: `Successfully sent ${result.sent} emails`,
        sent: result.sent,
      });
    } else {
      res.status(207).json({
        success: false,
        message: `Sent ${result.sent} emails, ${result.failed} failed`,
        sent: result.sent,
        failed: result.failed,
        errors: result.errors,
      });
    }
  } catch (error: any) {
    console.error('Send emails error:', error);
    res.status(500).json({
      error: 'Failed to send emails',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/test-email
 * 发送测试邮件
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email address required',
      });
    }

    const { sendTestEmail } = await import('../services/emailService');
    const success = await sendTestEmail(email);

    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email',
      });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: 'Failed to send test email',
      details: error.message,
    });
  }
});

// 在现有的 adminRoutes.ts 文件中添加以下代码

/**
 * POST /api/admin/assessments/:id/send-reports
 * 发送个人报告邮件给所有参与者
 */
router.post('/assessments/:id/send-reports', async (req, res) => {
  try {
    const { id } = req.params;

    // 获取评估和团队报告
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        codes: {
          where: {
            isUsed: true,
          },
        },
        teamReport: true,
      },
    });

    if (!assessment) {
      return res.status(404).json({
        error: 'Assessment not found',
      });
    }

    if (!assessment.teamReport) {
      return res.status(400).json({
        error: 'Team report not calculated yet. Please calculate first.',
      });
    }

    // 准备邮件数据
    const emailReports = assessment.codes.map((code) => {
      // 解析个人得分
      const scoresData = JSON.parse(code.scores!);
      
      return {
        participantName: code.name!,
        participantEmail: code.email!,
        teamName: assessment.teamName,
        personalScore: scoresData.personalScore,
        teamScore: assessment.teamReport!.teamScore,
        reportLink: `${process.env.FRONTEND_URL}/participant/${code.code}/report`,
      };
    });

    // 发送邮件
    const { sendBulkPersonalReports } = await import('../services/emailService');
    const result = await sendBulkPersonalReports(emailReports);

    res.json({
      success: true,
      message: 'Emails sent successfully',
      result: {
        total: emailReports.length,
        success: result.success,
        failed: result.failed,
      },
    });
  } catch (error: any) {
    console.error('Send reports error:', error);
    res.status(500).json({
      error: 'Failed to send reports',
      details: error.message,
    });
  }
});


export default router;
