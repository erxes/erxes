import { debugError } from '@erxes/api-utils/src/debuggers';
import {
  sendClientPortalMessagge,
  sendCommonMessage,
  sendCoreMessage,
  sendSegmentsMessage
} from './messageBroker';

export default {
  constants: {
    actions: [
      {
        type: 'notifications:appNotification.create',
        icon: 'telegram-alt',
        label: 'Push in-App Notification',
        description: 'push in-app notification',
        isAvailable: true
      }
    ]
  },
  receiveActions: async ({ subdomain, data }) => {
    const { action, execution } = data;

    const { triggerType } = execution;

    const [serviceName, contentType] = triggerType.split(':');

    let { target } = execution;
    const { config } = action;

    const { subject, body } = await sendCommonMessage({
      subdomain,
      serviceName,
      action: 'automations.replacePlaceHolders',
      data: {
        target: { ...target, type: contentType },
        config: {
          subject: config?.subject || '',
          body: config?.body || ''
        }
      },
      isRPC: true,
      defaultValue: {}
    });

    const commonDoc = {
      subdomain,
      subject,
      body,
      target,
      customConfig: config?.customConfig
    };

    console.log({ commonDoc });

    let teamMemberIds = [...(config?.teamMemberIds || [])];
    let customerIds = [...(config?.customerIds || [])];

    if (!!config?.teamMemberIds?.length) {
      await handleTeamMembersAppNotifications({
        ...commonDoc,
        teamMemberIds: config.teamMemberIds
      });
    }
    if (!!config?.customerIds?.length) {
      await handleCustomerAppNotifications({
        ...commonDoc,
        customerIds: config.customerIds
      });
    }
    if (config.sendTo) {
      const result = await generateSendToIds({
        subdomain,
        execution,
        value: config?.sendTo || '',
        triggerType,
        target
      });

      teamMemberIds = [...teamMemberIds, ...result.teamMemberIds];
      customerIds = [...customerIds, ...result.customerIds];
    }

    if (!customerIds?.length && !teamMemberIds?.length) {
      return 'Not Found';
    }

    if (!!customerIds?.length) {
      await handleCustomerAppNotifications({
        ...commonDoc,
        customerIds
      });
    }

    if (!!teamMemberIds?.length) {
      await handleTeamMembersAppNotifications({
        ...commonDoc,
        teamMemberIds
      });
    }

    return 'Sent';
  }
};

const generateTriggerExcutorIds = async ({ subdomain, execution }) => {
  const { triggerConfig, targetId } = execution;
  const contentTypeIds = await sendSegmentsMessage({
    subdomain,
    action: 'fetchSegment',
    data: {
      segmentId: triggerConfig.contentId,
      options: {
        defaultMustSelector: [
          {
            match: {
              _id: targetId
            }
          }
        ]
      }
    },
    isRPC: true,
    defaultValue: []
  });
  return contentTypeIds;
};
const generateIds = entry => {
  if (Array.isArray(entry)) {
    return entry.filter(value => typeof value === 'string');
  }

  if (typeof entry === 'string') {
    return entry.split(', ');
  }

  return [];
};

const generateSendToIds = async ({
  subdomain,
  execution,
  value,
  triggerType,
  target
}) => {
  const [serviceName, type] = triggerType.split(':');

  let customerIds: string[] = [];
  let teamMemberIds: string[] = [];

  const matches = (value || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
  let attributes = matches.map(match => match.replace(/\{\{\s*|\s*\}\}/g, ''));

  if (attributes.find(attribute => attribute === 'triggerExecutor')) {
    const triggerExecutorIds = await generateTriggerExcutorIds({
      subdomain,
      execution
    });

    if (triggerType.includes('user')) {
      teamMemberIds = [...teamMemberIds, ...triggerExecutorIds];
    }
    if (triggerType.includes('customer')) {
      customerIds = [...customerIds, ...triggerExecutorIds];
    }

    attributes = attributes.filter(
      attribute => attribute !== 'triggerExecutor'
    );
  }

  if (!!attributes?.length) {
    const obj = {};

    for (const attribute of attributes) {
      obj[attribute] = `{{ ${attribute} }}`;
    }

    const replacedContent = await sendCommonMessage({
      subdomain,
      serviceName,
      action: 'automations.replacePlaceHolders',
      data: {
        target: {
          ...target,
          customers: null,
          companies: null,
          type: type.includes('.') ? type.split('.')[0] : type
        },
        config: obj,
        relatedValueProps: { key: '_id' }
      },
      isRPC: true,
      defaultValue: {}
    });

    for (const [key, value] of Object.entries(replacedContent)) {
      if (
        (key || '').toLowerCase().includes('customer') ||
        triggerType.includes('customer')
      ) {
        customerIds = [...customerIds, ...generateIds(value)];
      } else {
        teamMemberIds = [...teamMemberIds, ...generateIds(value)];
      }
    }
  }

  return { teamMemberIds, customerIds };
};

const handleTeamMembersAppNotifications = async ({
  subject,
  body,
  teamMemberIds,
  target,
  customConfig
}) => {
  try {
    return await sendCoreMessage({
      subdomain: 'os',
      action: 'sendMobileNotification',
      data: {
        title: subject,
        body: body,
        receivers: teamMemberIds,
        customConfig,
        data: { targetId: target._id }
      }
    });
  } catch (error) {
    debugError(error.message);
  }
};

const handleCustomerAppNotifications = async ({
  subdomain,
  subject,
  body,
  customerIds,
  target,
  customConfig
}) => {
  try {
    const cpUsers = await sendClientPortalMessagge({
      subdomain,
      action: 'clientPortalUsers.find',
      data: { erxesCustomerId: { $in: customerIds } },
      isRPC: true,
      defaultValue: []
    });

    sendClientPortalMessagge({
      subdomain,
      action: 'sendNotification',
      data: {
        title: subject,
        content: body,
        receivers: cpUsers.map(cpUser => cpUser._id),
        eventData: { targetId: target._id },
        notifType: 'system',
        isMobile: true,
        link: '',
        customConfig
      }
    });
  } catch (error) {
    debugError(error.message);
    throw new Error(error.message);
  }
};
