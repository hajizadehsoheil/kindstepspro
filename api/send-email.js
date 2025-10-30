// api/send-email.js
// سرورلس فانکشن روی Vercel برای ارسال ایمیل با SMTP خودت
import nodemailer from "nodemailer";

// خواندن JSON از بادی (برای Vercel Node function)
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8") || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, phone, preferred, service, childAge, message } =
      await readJsonBody(req);

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ===== Env Vars — از داشبورد Vercel ست می‌کنیم =====
    const {
      MAIL_HOST, // مثلا: smtp.gmail.com یا mail.example.com
      MAIL_PORT, // مثلا: 465 (secure) یا 587
      MAIL_SECURE, // "true" یا "false" (رشته)
      MAIL_USER, // نام کاربری SMTP (ایمیل/یوزرنیم)
      MAIL_PASS, // پسورد SMTP (برای Gmail باید App Password باشد)
      MAIL_FROM, // فرستنده: مثلاً "Kind Steps <no-reply@kindsteps.ca>"
      MAIL_TO, // گیرنده: مثلاً "info@kindsteps.ca"
      MAIL_REPLY_TO, // اختیاری: اگر خالی باشد، از email کاربر استفاده می‌کنیم
    } = process.env;

    if (
      !MAIL_HOST ||
      !MAIL_PORT ||
      !MAIL_USER ||
      !MAIL_PASS ||
      !MAIL_FROM ||
      !MAIL_TO
    ) {
      return res.status(500).json({ error: "Server email config missing." });
    }

    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: MAIL_SECURE === "true", // true برای 465، false برای 587
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    const subject = `New consultation request from ${name}`;
    const html = `
      <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;line-height:1.6">
        <h2 style="margin:0 0 8px">Kind Steps ABA — New Inquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        ${phone ? `<p><b>Phone:</b> ${phone}</p>` : ""}
        ${preferred ? `<p><b>Preferred contact:</b> ${preferred}</p>` : ""}
        ${service ? `<p><b>Service of interest:</b> ${service}</p>` : ""}
        ${childAge ? `<p><b>Age:</b> ${childAge}</p>` : ""}
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap">${message}</pre>
        <hr/>
        <small>Sent from contact form</small>
      </div>
    `;

    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: MAIL_REPLY_TO || email,
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("SMTP send error:", err);
    return res.status(500).json({ error: "Email send failed." });
  }
}
