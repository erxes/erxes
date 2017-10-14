import nodemailer from 'nodemailer';

export const sendEmail = ({ toEmails, fromEmail, title, content }) => {
  const { MAIL_SERVICE, MAIL_USER, MAIL_PASS } = process.env;

  const transporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  toEmails.forEach(toEmail => {
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: title,
      text: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};
