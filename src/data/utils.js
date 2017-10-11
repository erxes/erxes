import nodemailer from 'nodemailer';
import { Channels, Notifications } from '../db/models';

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

export const sendChannelNotifications = async ({ channelId, _memberIds, userId }) => {
  const memberIds = _memberIds || [];
  const channel = await Channels.findOne({ _id: channelId });

  const content = `You have invited to '${channel.name}' channel.`;

  return sendNotification({
    createdUser: userId,
    notifType: 'channelMembersChange',
    title: content,
    content,
    link: `/inbox/${channel._id}`,

    // Exclude current user
    receivers: memberIds.filter(id => id !== userId),
  });
};

/**
 * Send a notification
 * @param {String} doc.notifType
 * @param {String} doc.createdUser
 * @param {String} doc.title
 * @param {String} doc.content
 * @param {String} doc.link
 * @param {Array} doc.receivers Array of userIds
 * @return null
 */
export const sendNotification = async ({ receivers, ...doc }) => {
  // Inserting entry to every receiver
  for (const receiverId of receivers) {
    doc.receiver = receiverId;

    try {
      // Create notification
      await Notifications.createNotification(doc);
      // TODO: Implement sendEmail
    } catch (e) {
      if (e.message != 'Configuration does not exist') {
        return e;
      }
    }
  }

  return;
};
