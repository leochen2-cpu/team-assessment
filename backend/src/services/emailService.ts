import axios from 'axios';

// HubSpot API 配置
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || '';
const HUBSPOT_API_URL = 'https://api.hubapi.com/marketing/v3/transactional/single-email/send';

interface EmailRecipient {
  email: string;
  name: string;
}

interface PersonalReportData {
  participantName: string;
  participantEmail: string;
  personalScore: number;
  teamAverageScore: number;
  grade: string;
  dimensionScores: {
    teamConnection: number;
    appreciation: number;
    responsiveness: number;
    trustPositivity: number;
    conflictManagement: number;
    goalSupport: number;
    warningSigns: number;
  };
  dimensionAverages: {
    teamConnection: number;
    appreciation: number;
    responsiveness: number;
    trustPositivity: number;
    conflictManagement: number;
    goalSupport: number;
    warningSigns: number;
  };
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
}

interface TeamReportSummary {
  teamName: string;
  teamScore: number;
  teamGrade: string;
  participationCount: number;
  reportUrl: string;
}

/**
 * 通过 HubSpot 发送个人报告邮件
 */
export async function sendPersonalReport(
  reportData: PersonalReportData,
  teamSummary: TeamReportSummary
): Promise<{ success: boolean; error?: string }> {
  try {
    // HubSpot Transactional Email 请求
    const response = await axios.post(
      HUBSPOT_API_URL,
      {
        emailId: parseInt(process.env.HUBSPOT_PERSONAL_REPORT_TEMPLATE_ID || '0'),
        message: {
          to: reportData.participantEmail,
          from: process.env.SENDER_EMAIL || 'noreply@yourcompany.com',
          subject: `Your Team Assessment Results - ${reportData.participantName}`,
        },
        contactProperties: {
          // HubSpot 联系人属性
          email: reportData.participantEmail,
          firstname: reportData.participantName.split(' ')[0],
          lastname: reportData.participantName.split(' ').slice(1).join(' ') || '',
        },
        customProperties: {
          // 自定义属性 - 用于邮件模板变量
          participant_name: reportData.participantName,
          personal_score: reportData.personalScore.toFixed(1),
          team_average_score: teamSummary.teamScore.toFixed(1),
          grade: reportData.grade,
          team_name: teamSummary.teamName,
          team_grade: teamSummary.teamGrade,
          participation_count: teamSummary.participationCount.toString(),
          
          // 维度得分
          dim_team_connection: reportData.dimensionScores.teamConnection.toFixed(1),
          dim_appreciation: reportData.dimensionScores.appreciation.toFixed(1),
          dim_responsiveness: reportData.dimensionScores.responsiveness.toFixed(1),
          dim_trust_positivity: reportData.dimensionScores.trustPositivity.toFixed(1),
          dim_conflict_management: reportData.dimensionScores.conflictManagement.toFixed(1),
          dim_goal_support: reportData.dimensionScores.goalSupport.toFixed(1),
          dim_warning_signs: reportData.dimensionScores.warningSigns.toFixed(1),
          
          // 团队平均
          avg_team_connection: reportData.dimensionAverages.teamConnection.toFixed(1),
          avg_appreciation: reportData.dimensionAverages.appreciation.toFixed(1),
          avg_responsiveness: reportData.dimensionAverages.responsiveness.toFixed(1),
          avg_trust_positivity: reportData.dimensionAverages.trustPositivity.toFixed(1),
          avg_conflict_management: reportData.dimensionAverages.conflictManagement.toFixed(1),
          avg_goal_support: reportData.dimensionAverages.goalSupport.toFixed(1),
          avg_warning_signs: reportData.dimensionAverages.warningSigns.toFixed(1),
          
          // 优势和成长领域
          strengths: reportData.strengths.join(', '),
          growth_areas: reportData.growthAreas.join(', '),
          recommendations: reportData.recommendations.join(', '),
          
          // 团队报告链接
          team_report_url: teamSummary.reportUrl,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Email sent successfully to ${reportData.participantEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('HubSpot email sending error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * 批量发送个人报告给所有参与者
 */
export async function sendBatchPersonalReports(
  reports: PersonalReportData[],
  teamSummary: TeamReportSummary
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const report of reports) {
    try {
      const result = await sendPersonalReport(report, teamSummary);
      
      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${report.participantEmail}: ${result.error}`);
      }

      // 避免 HubSpot API 限流（每秒最多 10 个请求）
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error: any) {
      failed++;
      errors.push(`${report.participantEmail}: ${error.message}`);
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
    errors,
  };
}

/**
 * 发送测试邮件
 */
export async function sendTestEmail(recipientEmail: string): Promise<boolean> {
  try {
    const response = await axios.post(
      HUBSPOT_API_URL,
      {
        emailId: parseInt(process.env.HUBSPOT_TEST_TEMPLATE_ID || '0'),
        message: {
          to: recipientEmail,
          from: process.env.SENDER_EMAIL || 'noreply@yourcompany.com',
          subject: 'Test Email from Team Assessment System',
        },
        customProperties: {
          test_message: 'This is a test email from the Team Assessment System.',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Test email sent successfully');
    return true;
  } catch (error: any) {
    console.error('Test email failed:', error.response?.data || error.message);
    return false;
  }
}