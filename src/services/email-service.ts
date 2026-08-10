import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailService = {
  sendEmail: async function (to: string, subject: string, htmlContent: string) {
    try {
      const data = await resend.emails.send({
        from: "Monolith OSR <noreply@osrmonolith.space>",
        to,
        subject,
        html: htmlContent,
      });

      return data;
    } catch (error) {
      console.error("ERROR SENDING EMAIL: ", error);
      throw new Error("Error sending email");
    }
  },

  // CHANGE think about emails styling and do something better and less generic in the future

  sendActivationLink: async function (email: string, activationLink: string) {
    const activationUrl = `${process.env.CLIENT_URL}/verify?link=${activationLink}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333333;">
        <div style="max-w-md mx-auto background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
          <h2 style="color: #111111; margin-bottom: 20px;">Підтвердження реєстрації у Monolith</h2>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Вітаємо, ви успішно створили акаунт. Щоб завершити реєстрацію та отримати повний доступ до функціоналу, будь ласка, підтвердіть свою електронну адресу, натиснувши кнопку нижче.
          </p>
          <a href="${activationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin-bottom: 10px;">
            Підтвердити email
          </a>
          <p style="font-size: 14px; color: #666666; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
            Якщо ви не створювали цей акаунт, просто проігноруйте цей лист.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(email, "MONOLITH | Підтвердження акаунту", html);
  },

  sendPasswordResetLink: async function (email: string, resetToken: string) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px; color: #333333;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
          <h2 style="color: #111111; margin-bottom: 20px;">Відновлення доступу</h2>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Була зроблена спроба скидання паролю для вашого акаунту. Якщо це були ви, натисніть на кнопку нижче, щоб створити новий пароль. 
            <br/><br/>
            <strong>Це посилання дійсне протягом 1 години.</strong>
          </p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Скинути пароль
          </a>
          <p style="font-size: 14px; color: #666666; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
            Якщо ви не робили цей запит, просто проігноруйте цей лист. Ваш пароль залишиться без змін, а доступ до акаунту буде в безпеці.
          </p>
        </div>
      </div>
    `;
    return this.sendEmail(
      email,
      "MONOLITH | Відновлення доступу до акаунту",
      html,
    );
  },
};

export default emailService;
