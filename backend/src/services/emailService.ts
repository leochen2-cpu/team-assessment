import nodemailer from 'nodemailer';

// Gmail SMTP 配置
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// 验证邮件配置
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};

interface PersonalReportEmailData {
  participantName: string;
  participantEmail: string;
  teamName: string;
  personalScore: number;
  teamScore: number;
  reportLink: string;
}

/**
 * 发送个人报告邮件
 */
export const sendPersonalReportEmail = async (data: PersonalReportEmailData): Promise<boolean> => {
  try {
    const htmlTemplate = getPersonalReportEmailTemplate(data);

    const mailOptions = {
      from: `"Team Assessment System" <${process.env.GMAIL_USER}>`,
      to: data.participantEmail,
      subject: `Your Team Assessment Results - ${data.teamName}`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${data.participantEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${data.participantEmail}:`, error);
    return false;
  }
};

/**
 * 批量发送个人报告邮件
 */
export const sendBulkPersonalReports = async (
  reports: PersonalReportEmailData[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const report of reports) {
    const sent = await sendPersonalReportEmail(report);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    // 添加延迟避免触发 Gmail 限制
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return { success, failed };
};

/**
 * HTML 邮件模板
 */
function getPersonalReportEmailTemplate(data: PersonalReportEmailData): string {
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 55) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Improvement';
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Team Assessment Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 Your Assessment Results
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                ${data.teamName}
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${data.participantName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for completing the team effectiveness assessment! All team members have now submitted their responses, and your personalized report is ready.
              </p>
            </td>
          </tr>
          
          <!-- Score Cards -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Personal Score -->
                  <td width="48%" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your Score
                    </p>
                    <p style="margin: 0; color: ${getScoreColor(data.personalScore)}; font-size: 48px; font-weight: 800; line-height: 1;">
                      ${data.personalScore.toFixed(1)}
                    </p>
                    <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px; font-weight: 600;">
                      ${getScoreGrade(data.personalScore)}
                    </p>
                  </td>
                  
                  <td width="4%"></td>
                  
                  <!-- Team Average -->
                  <td width="48%" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Team Average
                    </p>
                    <p style="margin: 0; color: ${getScoreColor(data.teamScore)}; font-size: 48px; font-weight: 800; line-height: 1;">
                      ${data.teamScore.toFixed(1)}
                    </p>
                    <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      ${getScoreGrade(data.teamScore)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- View Report Button -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="${data.reportLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.4);">
                📊 View Your Complete Report
              </a>
            </td>
          </tr>
          
          <!-- What's Included -->
          <tr>
            <td style="padding: 0 30px 30px 30px; background-color: #f9fafb;">
              <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 700;">
                📋 Your Report Includes:
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #374151; font-size: 15px;">Scores across 7 key dimensions</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #374151; font-size: 15px;">Comparison with team averages</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #374151; font-size: 15px;">Your personal strengths</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #374151; font-size: 15px;">Growth opportunities</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 10px;">✓</span>
                    <span style="color: #374151; font-size: 15px;">Personalized action recommendations</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Questions? Contact your team administrator.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated email from the Team Assessment System.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
}

export default {
  verifyEmailConfig,
  sendPersonalReportEmail,
  sendBulkPersonalReports,
};






