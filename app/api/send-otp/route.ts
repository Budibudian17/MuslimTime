import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create Gmail SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'your-email@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
    }
  });
};

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const emailData = {
      to: email,
      subject: `Kode Verifikasi MuslimTime - ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fb;">
          <div style="background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(37,99,235,0.25); border: 1px solid rgba(37,99,235,0.35);">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 0.5px;">MuslimTime</h1>
            <p style="color: #DBEAFE; margin: 10px 0 0 0; opacity: 0.95; font-size: 13px;">Aplikasi Islami untuk Waktu Sholat dan Al-Quran</p>
            <p style="color: #DBEAFE; margin: 14px 0 0; font-weight: 600;">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          </div>

          <div style="background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(2,6,23,0.08); border: 1px solid #E5E7EB;">
            <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 22px;">Kode Verifikasi</h2>

            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
              Assalamu’alaikum,<br><br>
              Terima kasih telah mendaftar di <strong>MuslimTime</strong>.<br>
              Untuk menyelesaikan pendaftaran, silakan masukkan kode verifikasi berikut:
            </p>

            <div style="background: #EEF2FF; padding: 22px; border-radius: 10px; text-align: center; margin: 18px 0; border: 1px dashed #C7D2FE;">
              <div style="font-size: 34px; font-weight: 800; color: #1E3A8A; letter-spacing: 6px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
                ${code}
              </div>
              <div style="font-size: 12px; color: #1E40AF; margin-top: 8px;">Gunakan kode ini sebelum masa berlaku habis</div>
            </div>

            <div style="background: #FFFBEB; border: 1px solid #F59E0B; padding: 14px 16px; border-radius: 10px; margin: 18px 0;">
              <p style="color: #92400E; margin: 0; font-size: 13px;">
                <strong>⚠️ Penting:</strong> Kode ini berlaku selama <strong>10 menit</strong> dan maksimal <strong>3 kali percobaan</strong>.
              </p>
            </div>

            <p style="color: #6B7280; font-size: 13px; line-height: 1.7; margin: 18px 0 0 0;">
              Jika Anda tidak meminta kode ini, mohon abaikan email ini. Akun tidak akan dibuat tanpa verifikasi.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 18px; background: #F1F5FF; border-radius: 10px; border: 1px solid #DBEAFE;">
            <p style="color: #1E40AF; font-size: 12px; margin: 0;">
              Salam hangat,<br>
              <strong>Tim MuslimTime</strong>
            </p>
          </div>
        </div>
      `,
      text: `
Assalamualaikum,

Terima kasih telah mendaftar di MuslimTime!

Kode verifikasi Anda adalah: ${code}

Kode ini berlaku selama 10 menit dan hanya bisa digunakan 3 kali.
Jika Anda tidak meminta kode ini, silakan abaikan email ini.

Salam,
Tim MuslimTime
      `
    };

    // Check if Gmail credentials are configured
    const hasGmailConfig = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    
    if (hasGmailConfig) {
      // Send real email using Gmail SMTP
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"MuslimTime" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', info.messageId);
      
      return NextResponse.json({ success: true });
    } else {      
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim email verifikasi' },
      { status: 500 }
    );
  }
}
