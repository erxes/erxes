import { getEnv } from '@erxes/api-utils/src';
import { IModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import * as AWS from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { IUserDocument } from '@erxes/api-utils/src/types';
import {
  IConfig,
  INotificationDocument
} from './models/definitions/notifications';
import { getOrganizationDetail } from '@erxes/api-utils/src/saas/saas';
import path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

type ICheckAllowed = {
  ok: boolean;
  customHtml?: string;
};

const checkAllowed = ({
  type,
  contentType,
  notifType,
  config,
  defaultConfig
}: {
  type: 'email' | 'desktop';
  contentType: string;
  notifType: string;
  config: IConfig;
  defaultConfig?: IConfig | null;
}): ICheckAllowed => {
  const field =
    type === 'desktop'
      ? ['isAllowedDesktop', 'isDisabledDesktop']
      : ['isAllowEmail', 'isDisabledEmail'];

  if (config[field[0]]) {
    const { pluginsConfigs = [] } = config;
    const pluginConfig = pluginsConfigs.find(
      ({ type }) => type === contentType
    );
    if (!pluginConfig?.isDisabled) {
      const { notifTypes = [] } = pluginConfig || {};

      const notifTypeConfig = notifTypes?.find(
        notif => notif.notifType === notifType
      );

      if (!notifTypeConfig?.isDisabled && !(notifTypeConfig || {})[field[1]]) {
        return { ok: true, customHtml: notifTypeConfig?.customHtml };
      }
    }
  }

  if (defaultConfig) {
    return checkAllowed({
      type,
      contentType,
      notifType,
      config: defaultConfig
    });
  }
  return { ok: false };
};
const applyTemplate = async (data: any, customHtml?: string) => {
  if (customHtml) {
    const dataKeys = Object.keys(data);

    for (const key of dataKeys) {
      customHtml.replace(`{{ ${key} }}`, data[key]);
    }
    return customHtml;
  }

  const filePath = path.resolve(
    __dirname,
    `../private/emailTemplates/notification.html`
  );
  let template: any = fs.promises.readFile(filePath, 'utf8');

  template = Handlebars.compile(template.toString());

  return template(data);
};

const initEmailTransporter = async configs => {
  const createTransporter = async ({ ses }, configs) => {
    if (ses) {
      const AWS_SES_ACCESS_KEY_ID = configs['AWS_SES_ACCESS_KEY_ID'] || '';
      const AWS_SES_SECRET_ACCESS_KEY =
        configs['AWS_SES_SECRET_ACCESS_KEY'] || '';
      const AWS_REGION = configs['AWS_REGION'] || '';

      AWS.config.update({
        region: AWS_REGION,
        accessKeyId: AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: AWS_SES_SECRET_ACCESS_KEY
      });

      return nodemailer.createTransport({
        SES: new AWS.SES({ apiVersion: '2010-12-01' })
      });
    }

    const MAIL_SERVICE = configs['MAIL_SERVICE'] || '';
    const MAIL_PORT = configs['MAIL_PORT'] || '';
    const MAIL_USER = configs['MAIL_USER'] || '';
    const MAIL_PASS = configs['MAIL_PASS'] || '';
    const MAIL_HOST = configs['MAIL_HOST'] || '';

    let auth;

    if (MAIL_USER && MAIL_PASS) {
      auth = {
        user: MAIL_USER,
        pass: MAIL_PASS
      };
    }

    return nodemailer.createTransport({
      service: MAIL_SERVICE,
      host: MAIL_HOST,
      port: MAIL_PORT,
      auth
    });
  };

  const DEFAULT_EMAIL_SERVICE = configs['DEFAULT_EMAIL_SERVICE'] || 'SES';

  try {
    const transporter = await createTransporter(
      { ses: DEFAULT_EMAIL_SERVICE === 'SES' },
      configs
    );

    return { transporter, configs };
  } catch (e) {
    return debugError(e.message);
  }
};

const createNotification = async ({
  models,
  subdomain,
  doc,
  link,
  receiverId
}: {
  models: IModels;
  subdomain: string;
  doc: ISendNotification;
  link: string;
  receiverId: string;
}): Promise<INotificationDocument> => {
  const {
    createdUser,
    title,
    content,
    notifType,
    action,
    contentType,
    contentTypeId
  } = doc;
  const notification = await models.Notifications.createNotification(
    {
      link,
      title,
      content,
      notifType,
      receiver: receiverId,
      action,
      contentType,
      contentTypeId
    },
    createdUser._id
  );

  graphqlPubsub.publish(`notificationInserted:${subdomain}:${receiverId}`, {
    notificationInserted: {
      _id: notification._id,
      userId: receiverId,
      title: notification.title,
      content: notification.content
    }
  });
  return notification;
};

const sendEmail = async ({
  models,
  subdomain,
  transporter,
  isAllowEmail,
  users,
  notificationId,
  receiverId,
  configs,
  customHtml
}: {
  models: IModels;
  subdomain: string;
  transporter: any;
  isAllowEmail?: boolean;
  users: IUserDocument[];
  notificationId: string;
  receiverId: string;
  configs: any;
  customHtml: any;
}) => {
  if (isAllowEmail && transporter) {
    const user = users.find(({ _id }) => _id === receiverId);
    if (user) {
      try {
        const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
        const COMPANY_EMAIL_FROM = configs['COMPANY_EMAIL_FROM'] || '';

        const data: any = {};

        data.domain = DOMAIN;

        let hasCompanyFromEmail =
          COMPANY_EMAIL_FROM && COMPANY_EMAIL_FROM.length > 0;
        if (models && subdomain && getOrganizationDetail) {
          const organization = await getOrganizationDetail({ subdomain });

          if (organization.isWhiteLabel) {
            data.whiteLabel = true;
            data.organizationName = organization.name || '';
            data.organizationDomain = organization.domain || '';

            hasCompanyFromEmail = true;
          } else {
            hasCompanyFromEmail = false;
          }
        }

        const html = await applyTemplate(data, customHtml);

        const mailOptions = {
          from: COMPANY_EMAIL_FROM,
          to: user.email,
          subject: 'Notification',
          html
        };

        await transporter.sendMail(mailOptions);
      } catch (error) {
        await models.Notifications.updateOne(
          { _id: notificationId },
          { $set: { error: error.message } }
        );
      }
    } else {
      await models.Notifications.updateOne(
        { _id: notificationId },
        { $set: { error: 'Email not found' } }
      );
    }
  }
};

interface ISendNotification {
  createdUser;
  receivers: string[];
  title: string;
  content: string;
  notifType: string;
  link: string;
  action: string;
  contentType: string;
  contentTypeId: string;
}

export const sendNotification = async ({
  models,
  subdomain,
  doc
}: {
  models: IModels;
  subdomain: string;
  doc: ISendNotification;
}) => {
  const { receivers, notifType, contentType } = doc;

  let link = doc.link;

  // remove duplicated ids
  const receiverIds = Array.from(new Set(receivers));

  await sendCoreMessage({
    subdomain,
    action: 'users.updateMany',
    data: {
      selector: {
        _id: { $in: receiverIds }
      },
      modifier: {
        $set: { isShowNotification: false }
      }
    }
  });

  const defaultConfig = await models.NotificationConfigurations.findOne({
    isDefault: true
  }).lean();

  const receiversConfigs = await models.NotificationConfigurations.find({
    userId: { $in: receiverIds }
  });

  let transporter;
  let configs;

  const users: IUserDocument[] = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        _id: { $in: receiverIds },
        isActive: true
      },
      fields: { email: 1 }
    },
    isRPC: true,
    defaultValue: []
  });

  if (receiversConfigs.find(({ isAllowEmail }) => isAllowEmail)) {
    configs = await sendCoreMessage({
      subdomain,
      action: 'getConfigs',
      data: {},
      isRPC: true,
      defaultValue: {}
    });

    transporter = await initEmailTransporter(configs);
  }

  for (const receiverId of receiverIds) {
    const receiverConfig = receiversConfigs.find(
      ({ userId }) => userId === receiverId
    );

    if (receiverConfig?.isDisabled) {
      continue;
    }

    const notification = await createNotification({
      models,
      subdomain,
      doc,
      link,
      receiverId
    });

    if (receiverConfig) {
      const { isAllowEmail } = receiverConfig;

      const { ok, customHtml } = checkAllowed({
        type: 'email',
        contentType,
        notifType,
        config: receiverConfig,
        defaultConfig
      });

      if (ok) {
        await sendEmail({
          models,
          subdomain,
          transporter,
          isAllowEmail,
          users,
          notificationId: notification._id,
          receiverId,
          configs,
          customHtml
        });
      }
    }
  }
};
