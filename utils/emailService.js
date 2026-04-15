const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendMail(options) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || `EventPro <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error.message);
      // Don't throw - email failure shouldn't break the flow
      return null;
    }
  }

  // Welcome Email
  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>
        body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6C63FF, #5a52d5); padding: 40px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .body { padding: 40px; }
        .body h2 { color: #333; }
        .body p { color: #666; line-height: 1.8; }
        .btn { display: inline-block; background: #6C63FF; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
      </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>🎉 Welcome to EventPro!</h1></div>
          <div class="body">
            <h2>Hello ${user.firstName}!</h2>
            <p>Welcome to EventPro - Your trusted event management partner. We're thrilled to have you on board!</p>
            <p>With EventPro, you can:</p>
            <ul style="color: #666; line-height: 2;">
              <li>Browse and book amazing events</li>
              <li>Manage your bookings effortlessly</li>
              <li>Get instant booking confirmations</li>
              <li>Access our gallery of past events</li>
            </ul>
            <a href="${process.env.BASE_URL}/events" class="btn">Explore Events →</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EventPro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: user.email,
      subject: '🎉 Welcome to EventPro - Let\'s Create Amazing Events!',
      html
    });
  }

  // Booking Confirmation Email
  async sendBookingConfirmation(booking, pdfPath) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>
        body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745, #20c997); padding: 40px; text-align: center; color: white; }
        .body { padding: 40px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; font-size: 14px; }
        .value { color: #333; font-weight: 600; font-size: 14px; }
        .total { background: #f0f0ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
      </style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Booking Confirmed!</h1>
            <p style="margin:10px 0 0;opacity:0.9;">Booking ID: ${booking.bookingId}</p>
          </div>
          <div class="body">
            <h2 style="color:#333;">Dear ${booking.contactName},</h2>
            <p style="color:#666;">Your event booking has been confirmed. Here are the details:</p>
            
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;color:#666;">Event</td><td style="padding:10px;color:#333;font-weight:600;">${booking.event?.title || 'Event'}</td></tr>
              <tr style="border-bottom:1px solid #eee;background:#f8f9fa;"><td style="padding:10px;color:#666;">Date</td><td style="padding:10px;color:#333;font-weight:600;">${new Date(booking.eventDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</td></tr>
              <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;color:#666;">Time</td><td style="padding:10px;color:#333;font-weight:600;">${booking.eventTime}</td></tr>
              <tr style="border-bottom:1px solid #eee;background:#f8f9fa;"><td style="padding:10px;color:#666;">Guests</td><td style="padding:10px;color:#333;font-weight:600;">${booking.guestCount}</td></tr>
              <tr style="border-bottom:1px solid #eee;"><td style="padding:10px;color:#666;">Package</td><td style="padding:10px;color:#333;font-weight:600;">${booking.selectedPackage?.name}</td></tr>
            </table>

            <div class="total">
              <p style="color:#666;margin:0;">Total Amount</p>
              <h2 style="color:#6C63FF;margin:5px 0;">₹${(booking.totalAmount || 0).toLocaleString('en-IN')}</h2>
              <p style="color:#28a745;margin:0;font-weight:600;">Payment: ${booking.paymentStatus}</p>
            </div>

            <p style="color:#666;">Your booking confirmation PDF is attached to this email. Please keep it for your records.</p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at support@eventpro.com</p>
            <p>© ${new Date().getFullYear()} EventPro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (pdfPath) {
      attachments.push({
        filename: `booking-${booking.bookingId}.pdf`,
        path: pdfPath
      });
    }

    return this.sendMail({
      to: booking.contactEmail,
      subject: `✓ Booking Confirmed - ${booking.bookingId} | EventPro`,
      html,
      attachments
    });
  }

  // Payment Receipt Email
  async sendPaymentReceipt(booking) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><style>
        body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6C63FF, #5a52d5); padding: 30px; text-align: center; color: white; }
        .body { padding: 30px; }
        .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; background: #f8f9fa; }
      </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>💳 Payment Receipt</h1></div>
          <div class="body">
            <h3 style="color:#333;">Payment Successful</h3>
            <p>Booking ID: <strong>${booking.bookingId}</strong></p>
            <p>Amount Paid: <strong style="color:#28a745;">₹${(booking.paidAmount || booking.totalAmount || 0).toLocaleString('en-IN')}</strong></p>
            <p>Payment ID: <strong>${booking.razorpayPaymentId || 'N/A'}</strong></p>
            <p>Date: <strong>${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></p>
          </div>
          <div class="footer"><p>© ${new Date().getFullYear()} EventPro</p></div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: booking.contactEmail,
      subject: `💳 Payment Receipt - ${booking.bookingId} | EventPro`,
      html
    });
  }
}

module.exports = new EmailService();
