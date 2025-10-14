import express from 'express';
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

/**
 * POST /api/assessments/calculate
 * 计算个人评估分数
 */
router.post('/calculate', (req, res) => {
  try {
    const responses: AssessmentResponses = req.body.responses;

    // 验证输入
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({
        error: '请提供有效的问卷答案',
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
        error: `缺少以下题目的答案: ${missingQuestions.join(', ')}`,
      });
    }

    // 验证答案范围（1-5）
    for (const [qId, value] of Object.entries(responses)) {
      if (value < 1 || value > 5) {
        return res.status(400).json({
          error: `${qId} 的答案必须在1-5之间`,
        });
      }
    }

    // 计算分数
    const dimensionScores = calculateDimensionScores(responses);
    const personalScore = calculatePersonalScore(dimensionScores);
    const grade = getScoreGrade(personalScore);
    const strengths = identifyStrengths(dimensionScores);
    const growthAreas = identifyGrowthAreas(dimensionScores);
    const recommendations = generateRecommendations(dimensionScores);

    // 返回完整结果
    res.json({
      success: true,
      result: {
        personalScore,
        grade,
        dimensionScores,
        strengths,
        growthAreas,
        recommendations,
        calculatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('评估计算错误:', error);
    res.status(500).json({
      error: '计算评估分数时出错',
      details: error.message,
    });
  }
});

/**
 * GET /api/assessments/test
 * 测试路由
 */
router.get('/test', (req, res) => {
  res.json({
    message: '评估API正常工作！',
    availableEndpoints: [
      'POST /api/assessments/calculate - 计算评估分数',
    ],
  });
});

export default router;