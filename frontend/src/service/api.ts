// 前端API服务 - 与后端通信

import axios from 'axios';

// 后端API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 问卷答案类型
export interface AssessmentResponses {
  [key: string]: number;
}

// 维度分数类型
export interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
  warningSigns: number;
}

// 评估结果类型
export interface AssessmentResult {
  personalScore: number;
  grade: string;
  dimensionScores: DimensionScores;
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
  calculatedAt: string;
}

/**
 * 提交问卷答案并获取评估结果
 */
export const calculateAssessment = async (
  responses: AssessmentResponses
): Promise<AssessmentResult> => {
  try {
    const response = await api.post('/assessments/calculate', {
      responses,
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || '评估失败');
    }
  } catch (error: any) {
    if (error.response) {
      // 服务器返回错误
      throw new Error(error.response.data.error || '服务器错误');
    } else if (error.request) {
      // 请求发送但没有收到响应
      throw new Error('无法连接到服务器，请确保后端正在运行');
    } else {
      // 其他错误
      throw new Error(error.message || '未知错误');
    }
  }
};

/**
 * 测试后端连接
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'OK';
  } catch (error) {
    return false;
  }
};

export default api;