import express from 'express';
import { PrismaClient } from '@prisma/client';
import {
  calculateDimensionScores,
  calculatePersonalScore,
  getScoreGrade,
  identifyStrengths,
  identifyGrowthAreas,
  generateRecommendations,
  type AssessmentResponses,
} from '../services/scoreCalculation';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/assessments/validate/:code
 * 验证 unique code 是否有效
 */
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // 查找code
    const participantCode = await prisma.participantCode.findUnique({
      where: { code },
      include: {
        assessment: {
          select: {
            teamName: true,
            status: true,
          },
        },
      },
    });

    if (!participantCode) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid code',
      });
    }

    // 检查评估是否还激活
    if (participantCode.assessment.status !== 'ACTIVE') {
      return res.status(400).json({
        valid: false,
        error: 'This assessment is no longer active',
      });
    }

    // 检查code是否已经被使用
    if (participantCode.isUsed) {
      return res.json({
        valid: true,
        alreadyUsed: true,
        message: 'This code has already been used',
      });
    }

    res.json({
      valid: true,
      alreadyUsed: false,
      assessment: {
        teamName: participantCode.assessment.teamName,
      },
    });
  } catch (error: any) {
    console.error('Validate code error:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate code',
      details: error.message,
    });
  }
});

/**
 * POST /api/assessments/:code/submit
 * 提交评估响应
 */
router.post('/:code/submit', async (req, res) => {
  try {
    const { code } = req.params;
    const { participantName, participantEmail, responses } = req.body;

    // 验证输入
    if (!participantName || !participantEmail || !responses) {
      return res.status(400).json({
        error: 'participantName, participantEmail, and responses are required',
      });
    }

    // 查找code
    const participantCode = await prisma.participantCode.findUnique({
      where: { code },
      include: {
        assessment: true,
      },
    });

    if (!participantCode) {
      return res.status(404).json({
        error: 'Invalid code',
      });
    }

    if (participantCode.assessment.status !== 'ACTIVE') {
      return res.status(400).json({
        error: 'This assessment is no longer active',
      });
    }

    // 检查code是否已经被使用
    if (participantCode.isUsed) {
      return res.status(400).json({
        error: 'This code has already been used',
      });
    }

    // 验证所有27题都有答案
    const missingQuestions = [];
    for (let i = 1; i <= 27; i++) {
      const qId = `Q${i}`;
      if (responses[qId] === undefined || responses[qId] === null) {
        missingQuestions.push(qId);
      }
    }

    if (missingQuestions.length > 0) {
      return res.status(400).json({
        error: `Missing answers for: ${missingQuestions.join(', ')}`,
      });
    }

    // 计算分数
    const dimensionScores = calculateDimensionScores(responses);
    const personalScore = calculatePersonalScore(dimensionScores);
    const grade = getScoreGrade(personalScore);
    const strengths = identifyStrengths(dimensionScores);
    const growthAreas = identifyGrowthAreas(dimensionScores);
    const recommendations = generateRecommendations(dimensionScores);

    const scoresData = {
      dimensionScores,
      personalScore,
      grade,
      strengths,
      growthAreas,
      recommendations,
    };

    // 更新code记录
    await prisma.participantCode.update({
      where: { code },
      data: {
        isUsed: true,
        name: participantName,
        email: participantEmail,
        responses: JSON.stringify(responses),
        scores: JSON.stringify(scoresData),
        submittedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
    });
  } catch (error: any) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      error: 'Failed to submit assessment',
      details: error.message,
    });
  }
});

export default router;
