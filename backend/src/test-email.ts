// 测试邮件配置脚本
// 放在 backend/src/test-email.ts

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testEmail() {
  console.log('=== 测试邮件配置 ===\n');

  // 1. 检查环境变量
  console.log('1️⃣ 检查环境变量:');
  console.log('   GMAIL_USER:', process.env.GMAIL_USER || '❌ 未设置');
  console.log('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ 已设置' : '❌ 未设置');
  console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || '❌ 未设置');
  console.log('');

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ 请先在 .env 文件中配置 GMAIL_USER 和 GMAIL_APP_PASSWORD');
    process.exit(1);
  }

  // 2. 创建 transporter
  console.log('2️⃣ 创建 SMTP 连接...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // 3. 验证连接
  try {
    console.log('3️⃣ 验证 SMTP 连接...');
    await transporter.verify();
    console.log('   ✅ SMTP 连接成功！\n');
  } catch (error: any) {
    console.error('   ❌ SMTP 连接失败:', error.message);
    console.error('\n可能的原因:');
    console.error('   - Gmail 应用专用密码不正确');
    console.error('   - 两步验证未开启');
    console.error('   - 密码中有空格（请去掉空格）');
    process.exit(1);
  }

  // 4. 发送测试邮件
  try {
    console.log('4️⃣ 发送测试邮件...');
    console.log(`   收件人: ${process.env.GMAIL_USER}`);
    
    const info = await transporter.sendMail({
      from: `"Team Assessment System" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // 发给自己
      subject: '✅ 测试邮件 - Team Assessment System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">✅ 邮件系统测试成功！</h2>
          <p>如果你收到这封邮件，说明你的邮件配置完全正确。</p>
          <p><strong>配置信息：</strong></p>
          <ul>
            <li>发件人: ${process.env.GMAIL_USER}</li>
            <li>发送时间: ${new Date().toLocaleString('zh-CN')}</li>
          </ul>
          <p style="color: #6b7280; font-size: 14px;">
            这是一封自动测试邮件，无需回复。
          </p>
        </div>
      `,
    });

    console.log('   ✅ 邮件发送成功！');
    console.log('   Message ID:', info.messageId);
    console.log('');
    console.log('🎉 所有测试通过！');
    console.log('');
    console.log('📧 请检查你的邮箱:', process.env.GMAIL_USER);
    console.log('   （如果没收到，请检查垃圾邮件文件夹）');
    
  } catch (error: any) {
    console.error('   ❌ 发送邮件失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
testEmail().catch(console.error);






