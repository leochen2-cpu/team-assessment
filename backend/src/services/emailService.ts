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

interface ReminderEmailData {
  email: string;
  code: string;
  teamName: string;
  name: string;
}

/**
 * 发送提醒邮件给单个参与者
 */
export const sendReminderEmail = async (data: ReminderEmailData): Promise<boolean> => {
  try {
    const htmlTemplate = getReminderEmailTemplate(data);

    const mailOptions = {
      from: `"Team Assessment System" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: `⏰ Reminder: Complete Your Team Assessment - ${data.teamName}`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${data.email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send reminder email to ${data.email}:`, error);
    return false;
  }
};

/**
 * 批量发送提醒邮件
 */
export const sendBulkReminderEmails = async (
  reminders: ReminderEmailData[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const reminder of reminders) {
    const sent = await sendReminderEmail(reminder);
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
 * 提醒邮件 HTML 模板
 */
function getReminderEmailTemplate(data: ReminderEmailData): string {
  const surveyLink = `${process.env.FRONTEND_URL}/survey/${data.code}/info`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: Complete Your Assessment</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Friendly Reminder
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                ${data.teamName}
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi <strong>${data.name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                This is a friendly reminder that we're still waiting for you to complete the team effectiveness assessment.
              </p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Your input is valuable to the team, and we'd love to hear your perspective. The survey only takes about <strong>5-7 minutes</strong> to complete.
              </p>
              
              <!-- Your Access Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #fef3c7; border-radius: 12px; padding: 20px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Your Access Code
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                      ${data.code}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${surveyLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                      Complete Assessment Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${surveyLink}" style="color: #667eea; text-decoration: none;">${surveyLink}</a>
              </p>
              
              <!-- What to Expect -->
              <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                  📋 What to Expect
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;">27 questions about team dynamics</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;">Takes only 5-7 minutes</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;">Your responses are confidential</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;">Personalized report after completion</span>
                    </td>
                  </tr>
                </table>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Questions? Contact your team administrator.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated reminder from the Team Assessment System.
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

interface InvitationEmailData {
  email: string;
  code: string;
  teamName: string;
}

/**
 * 发送邀请邮件给单个参与者
 */
export const sendInvitationEmail = async (data: InvitationEmailData): Promise<boolean> => {
  try {
    const htmlTemplate = getInvitationEmailTemplate(data);

    const mailOptions = {
      from: `"Team Assessment System" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: `You're Invited: Team Assessment - ${data.teamName}`,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent to ${data.email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send invitation email to ${data.email}:`, error);
    return false;
  }
};

/**
 * 批量发送邀请邮件
 */
export const sendBulkInvitationEmails = async (
  invitations: InvitationEmailData[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const invitation of invitations) {
    const sent = await sendInvitationEmail(invitation);
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
 * 邀请邮件 HTML 模板
 */
function getInvitationEmailTemplate(data: InvitationEmailData): string {
  const surveyLink = `${process.env.FRONTEND_URL}/survey/${data.code}/info`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Assessment Invitation</title>
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
              <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                You're Invited!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                ${data.teamName}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Hello! 👋
              </p>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                You've been invited to participate in a <strong>Team Effectiveness Assessment</strong> for <strong>${data.teamName}</strong>. This assessment helps us understand team dynamics and identify opportunities for growth.
              </p>
              
              <!-- Your Access Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Your Unique Access Code
                    </p>
                    <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                      ${data.code}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.5;">
                Keep this code safe! You'll need it to access the assessment.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${surveyLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                      Start Assessment Now →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${surveyLink}" style="color: #667eea; text-decoration: none; word-break: break-all;">${surveyLink}</a>
              </p>
              
              <!-- What to Expect Section -->
              <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                  📋 What to Expect
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;"><strong>27 questions</strong> about team dynamics</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;">Takes only <strong>5-7 minutes</strong></span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;">Your responses are <strong>confidential</strong></span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                      <span style="color: #374151; font-size: 15px;">Receive a <strong>personalized report</strong></span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Privacy Note -->
              <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border: 2px solid #fcd34d;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>🔒 Privacy Protected:</strong> Your individual responses are confidential. Only aggregated team data will be shared with administrators.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 2px solid #e5e7eb; background-color: #f9fafb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Questions? Contact your team administrator.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                This is an automated invitation from the Team Assessment System.
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

// ==============================================
// 🆕 新增：汇总报告邮件功能
// ==============================================

interface SummaryEmailData {
  organizationName: string;
  leaderName: string;
  totalTeams: number;
  completedTeams: number;
  averageTeamScore: number;
  highestScore: number;
  lowestScore: number;
  healthGrade: string;
  topPerformer: {
    teamName: string;
    score: number;
  };
  needsAttentionCount: number;
  dimensionAverages: {
    teamConnection: number;
    appreciation: number;
    responsiveness: number;
    trustPositivity: number;
    conflictManagement: number;
    goalSupport: number;
  };
  strengths: string[];
  concerns: string[];
  reportUrl: string;
}

/**
 * 🆕 生成汇总报告邮件 HTML
 */
export function generateSummaryReportEmailHTML(data: SummaryEmailData): string {
  const {
    organizationName,
    leaderName,
    totalTeams,
    completedTeams,
    averageTeamScore,
    highestScore,
    lowestScore,
    healthGrade,
    topPerformer,
    needsAttentionCount,
    dimensionAverages,
    strengths,
    concerns,
    reportUrl,
  } = data;

  // 根据分数确定颜色
  const scoreColor =
    averageTeamScore >= 90
      ? '#10b981' // green
      : averageTeamScore >= 75
      ? '#3b82f6' // blue
      : averageTeamScore >= 50
      ? '#f59e0b' // yellow
      : '#ef4444'; // red

  // 健康等级的中文翻译
  const healthGradeChinese =
    healthGrade === 'Exceptional'
      ? 'Exceptional'
      : healthGrade === 'Strong'
      ? 'Strong'
      : healthGrade === 'Developing'
      ? 'Developing'
      : 'Needs attention';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>团队效能汇总报告</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                📊 团队效能汇总报告
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                ${organizationName}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                尊敬的 <strong>${leaderName}</strong>，
              </p>
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                您好！以下是 <strong>${organizationName}</strong> 的团队效能评估汇总报告。
              </p>
            </td>
          </tr>

          <!-- Overall Score Card -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 2px solid ${scoreColor};">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">整体平均分数</div>
                    <div style="font-size: 48px; font-weight: 700; color: ${scoreColor}; margin-bottom: 8px;">
                      ${averageTeamScore.toFixed(1)}
                    </div>
                    <div style="font-size: 16px; font-weight: 600; color: ${scoreColor};">
                      ${healthGradeChinese}
                    </div>
                    <div style="font-size: 13px; color: #9ca3af; margin-top: 10px;">
                      完成率: ${completedTeams}/${totalTeams} (${((completedTeams / totalTeams) * 100).toFixed(0)}%)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Key Metrics -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 6px; border: 1px solid #d1fae5;">
                      <tr>
                        <td style="padding: 15px; text-align: center;">
                          <div style="font-size: 12px; color: #065f46; margin-bottom: 5px;">最高分</div>
                          <div style="font-size: 24px; font-weight: 700; color: #10b981;">
                            ${highestScore.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding-left: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 6px; border: 1px solid #fde68a;">
                      <tr>
                        <td style="padding: 15px; text-align: center;">
                          <div style="font-size: 12px; color: #92400e; margin-bottom: 5px;">最低分</div>
                          <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">
                            ${lowestScore.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Performer -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <div style="font-size: 13px; color: #1e40af; font-weight: 600; margin-bottom: 5px;">
                      🏆 最佳表现团队
                    </div>
                    <div style="font-size: 16px; color: #1f2937; font-weight: 600;">
                      ${topPerformer.teamName}
                    </div>
                    <div style="font-size: 14px; color: #3b82f6; margin-top: 3px;">
                      分数: ${topPerformer.score.toFixed(1)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Attention Needed -->
          ${
            needsAttentionCount > 0
              ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <div style="font-size: 13px; color: #991b1b; font-weight: 600; margin-bottom: 5px;">
                      ⚠️ 需要关注
                    </div>
                    <div style="font-size: 14px; color: #374151;">
                      ${needsAttentionCount} 个团队表现需要提升
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Dimension Scores -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px; font-weight: 600;">
                📈 维度表现
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${Object.entries(dimensionAverages)
                  .map(([key, value]) => {
                    const dimensionNames: Record<string, string> = {
                      teamConnection: 'Team Connection',
                      appreciation: 'Appreciation',
                      responsiveness: 'Responsiveness',
                      trustPositivity: 'Trust Positivity',
                      conflictManagement: 'Conflict Management',
                      goalSupport: 'Goal Support',
                    };
                    const barWidth = (value / 100) * 100;
                    const barColor = value >= 80 ? '#10b981' : value >= 70 ? '#3b82f6' : '#f59e0b';
                    
                    return `
                <tr>
                  <td style="padding: 8px 0;">
                    <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
                      ${dimensionNames[key]}
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #e5e7eb; border-radius: 4px; height: 8px; position: relative;">
                          <div style="background-color: ${barColor}; width: ${barWidth}%; height: 8px; border-radius: 4px;"></div>
                        </td>
                        <td style="padding-left: 10px; font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap;">
                          ${value.toFixed(1)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                    `;
                  })
                  .join('')}
              </table>
            </td>
          </tr>

          <!-- Strengths -->
          ${
            strengths.length > 0
              ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px; font-weight: 600;">
                💪 组织优势
              </h3>
              ${strengths
                .slice(0, 3)
                .map(
                  (strength) => `
              <div style="padding: 8px 12px; background-color: #f0fdf4; border-radius: 4px; margin-bottom: 6px; font-size: 14px; color: #166534;">
                ✓ ${strength}
              </div>
              `
                )
                .join('')}
            </td>
          </tr>
          `
              : ''
          }

          <!-- Concerns -->
          ${
            concerns.length > 0
              ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px; font-weight: 600;">
                🎯 关注领域
              </h3>
              ${concerns
                .slice(0, 3)
                .map(
                  (concern) => `
              <div style="padding: 8px 12px; background-color: #fef2f2; border-radius: 4px; margin-bottom: 6px; font-size: 14px; color: #991b1b;">
                → ${concern}
              </div>
              `
                )
                .join('')}
            </td>
          </tr>
          `
              : ''
          }

          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 30px 30px 30px; text-align: center;">
              <a href="${reportUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                查看完整汇总报告 →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                本报告由团队效能评估系统自动生成<br>
                如有疑问，请联系系统管理员
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

/**
 * 🆕 发送汇总报告邮件
 */
export async function sendSummaryReportEmail(
  recipientEmail: string,
  recipientName: string,
  summaryData: SummaryEmailData
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Team Assessment System" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `📊 ${summaryData.organizationName} - 团队效能汇总报告`,
      html: generateSummaryReportEmailHTML(summaryData),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Summary report email sent to: ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send summary report email:', error);
    return false;
  }
}

export default {
  verifyEmailConfig,
  sendPersonalReportEmail,
  sendBulkPersonalReports,
  sendReminderEmail,
  sendBulkReminderEmails,
  sendInvitationEmail,
  sendBulkInvitationEmails,
  generateSummaryReportEmailHTML,
  sendSummaryReportEmail,
};