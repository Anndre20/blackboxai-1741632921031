const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // Send email using template
  async sendEmail(options) {
    try {
      const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: this.getEmailTemplate(options)
      };

      const info = await this.transporter.sendMail(message);

      logger.info({
        type: 'EMAIL_SENT',
        messageId: info.messageId,
        to: options.email,
        subject: options.subject
      });

      return info;
    } catch (error) {
      logger.error({
        type: 'EMAIL_ERROR',
        error: error.message,
        to: options.email,
        subject: options.subject
      });
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      email: user.email,
      subject: 'Welcome to Dareon2.0',
      template: 'welcome',
      data: {
        name: user.firstName,
        verificationUrl: user.verificationUrl
      }
    });
  }

  // Send email verification
  async sendVerificationEmail(user, verificationUrl) {
    return this.sendEmail({
      email: user.email,
      subject: 'Verify Your Email',
      template: 'verification',
      data: {
        name: user.firstName,
        verificationUrl
      }
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetUrl) {
    return this.sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      template: 'passwordReset',
      data: {
        name: user.firstName,
        resetUrl
      }
    });
  }

  // Send subscription expiring notification
  async sendSubscriptionExpiringEmail(user) {
    return this.sendEmail({
      email: user.email,
      subject: 'Your Subscription is Expiring Soon',
      template: 'subscriptionExpiring',
      data: {
        name: user.firstName,
        expiryDate: user.subscription.endDate,
        renewalUrl: `${process.env.CLIENT_URL}/billing`
      }
    });
  }

  // Send storage limit warning
  async sendStorageLimitWarningEmail(user, usagePercentage) {
    return this.sendEmail({
      email: user.email,
      subject: 'Storage Limit Warning',
      template: 'storageLimitWarning',
      data: {
        name: user.firstName,
        usagePercentage,
        upgradeUrl: `${process.env.CLIENT_URL}/upgrade`
      }
    });
  }

  // Get email template
  getEmailTemplate(options) {
    const templates = {
      welcome: `
        <h1>Welcome to Dareon2.0, ${options.data.name}!</h1>
        <p>Thank you for joining Dareon2.0. We're excited to have you on board!</p>
        <p>To get started, please verify your email address by clicking the button below:</p>
        <a href="${options.data.verificationUrl}" style="
          background-color: #4F46E5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin: 16px 0;
        ">Verify Email</a>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      `,
      verification: `
        <h1>Verify Your Email</h1>
        <p>Hi ${options.data.name},</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${options.data.verificationUrl}" style="
          background-color: #4F46E5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin: 16px 0;
        ">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
      passwordReset: `
        <h1>Reset Your Password</h1>
        <p>Hi ${options.data.name},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <a href="${options.data.resetUrl}" style="
          background-color: #4F46E5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin: 16px 0;
        ">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      subscriptionExpiring: `
        <h1>Your Subscription is Expiring Soon</h1>
        <p>Hi ${options.data.name},</p>
        <p>Your Dareon2.0 subscription will expire on ${new Date(options.data.expiryDate).toLocaleDateString()}.</p>
        <p>To continue enjoying our services, please renew your subscription:</p>
        <a href="${options.data.renewalUrl}" style="
          background-color: #4F46E5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin: 16px 0;
        ">Renew Subscription</a>
      `,
      storageLimitWarning: `
        <h1>Storage Limit Warning</h1>
        <p>Hi ${options.data.name},</p>
        <p>You've used ${options.data.usagePercentage}% of your storage limit.</p>
        <p>To avoid any service interruptions, consider upgrading your plan:</p>
        <a href="${options.data.upgradeUrl}" style="
          background-color: #4F46E5;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
          margin: 16px 0;
        ">Upgrade Plan</a>
      `
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #4F46E5;
              margin-bottom: 24px;
            }
            p {
              margin-bottom: 16px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${templates[options.template]}
          <div class="footer">
            <p>This email was sent by Dareon2.0</p>
            <p>© ${new Date().getFullYear()} Dareon2.0. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
