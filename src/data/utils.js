import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import { MODULES } from './constants';
import { Channels, Notifications, Users } from '../db/models';

/**
 * Read template file with via utf-8
 * @param {String} assetPath
 * @return {String} file content
 */
const getTemplateContent = assetPath => {
  // TODO: test this method
  fs.readFile(assetPath, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }

    return data;
  });
};

/**
 * SendEmail template helper
 * @param {Object} data data
 * @param {String} templateName
 * @return email with template as text
 */
const applyTemplate = async (data, templateName) => {
  let template = await getTemplateContent(`emailTemplates/${templateName}.html`);

  template = Handlebars.compile(template);

  return template(data);
};

/**
 * Send email
 * @param {Array} args.toEmails
 * @param {String} args.fromEmail
 * @param {String} args.title
 * @param {String} args.templateArgs.name
 * @param {Object} args.templateArgs.data
 * @param {Boolean} args.isCustom
 * @return {Promise} null
*/
export const sendEmail = async ({ toEmails, fromEmail, title, templateArgs }) => {
  // TODO: test this method
  const { MAIL_SERVICE, MAIL_USER, MAIL_PASS, NODE_ENV } = process.env;
  const isTest = NODE_ENV == 'test';

  // do not send email it is running in test mode
  if (isTest) {
    return;
  }

  const transporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  const { isCustom, data, name } = templateArgs;

  // generate email content by given template
  const content = await applyTemplate(data, name);

  let text = '';

  if (isCustom) {
    text = content;
  } else {
    text = await applyTemplate({ content }, 'base');
  }

  return toEmails.map(toEmail => {
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: title,
      text,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};

/**
 * Send notification to all members of this channel except the sender
 * @param {String} channelId
 * @param {Array} memberIds
 * @param {String} userId
 * @return {Promise}
 */
export const sendChannelNotifications = async ({ channelId, memberIds, userId }) => {
  memberIds = memberIds || [];

  const channel = await Channels.findOne({ _id: channelId });

  const content = `You have invited to '${channel.name}' channel.`;

  return sendNotification({
    createdUser: userId,
    notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
    title: content,
    content,
    link: `/inbox/${channel._id}`,

    // exclude current user
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
 * @param {Array} doc.receivers Array of user ids
 * @return {Promise}
 */
export const sendNotification = async ({ createdUser, receivers, ...doc }) => {
  // collecting emails
  const recipients = await Users.find({ _id: { $in: receivers } });

  // collect recipient emails
  const toEmails = recipients.map(
    recipient => !(recipient.details && recipient.details.getNotificationByEmail === false),
  );

  // loop through receiver ids
  for (const receiverId of receivers) {
    doc.receiver = receiverId;

    try {
      // send notification
      await Notifications.createNotification(doc, createdUser);
    } catch (e) {
      // Any other error is serious
      if (e.message != 'Configuration does not exist') {
        throw e;
      }
    }
  }

  return sendEmail({
    toEmails,
    fromEmail: 'no-reply@erxes.io',
    title: 'Notification',
    template: {
      name: 'notification',
      data: {
        notification: doc,
      },
    },
  });
};
