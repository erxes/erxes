import { IUser } from 'erxes-api-shared/core-types';
import { getEnv, sendTRPCMessage } from 'erxes-api-shared/utils';
import moment from 'moment';
import { IModels } from '~/connectionResolvers';

export const getRelatedValue = async (
  models: IModels,
  subdomain: string,
  target: any = {},
  targetKey = '',
  relatedValueProps: any = {},
) => {
  if (
    [
      'userId',
      'assignedUserId',
      'closedUserId',
      'ownerId',
      'createdBy',
    ].includes(targetKey)
  ) {
    const user = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: { _id: target[targetKey] },
    });

    if (!!relatedValueProps[targetKey]) {
      const key = relatedValueProps[targetKey]?.key;
      return user[key];
    }

    return (
      (user && ((user.detail && user.detail.fullName) || user.email)) || ''
    );
  }

  if (
    ['participatedUserIds', 'assignedUserIds', 'watchedUserIds'].includes(
      targetKey,
    )
  ) {
    const users = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: {
        query: {
          _id: { $in: target[targetKey] },
        },
      },
    });

    if (!!relatedValueProps[targetKey]) {
      const { key, filter } = relatedValueProps[targetKey] || {};
      return users
        .filter((user) => (filter ? user[filter.key] === filter.value : user))
        .map((user) => user[key])
        .join(', ');
    }

    return (
      users.map(
        (user) => (user.detail && user.detail.fullName) || user.email,
      ) || []
    ).join(', ');
  }

  if (targetKey === 'tagIds') {
    const tags = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'tags',
      action: 'tagFind',
      input: { _id: { $in: target[targetKey] } },
    });

    return (tags.map((tag) => tag.name) || []).join(', ');
  }

  if (targetKey === 'labelIds') {
    const labels = await models.PipelineLabels.find({
      _id: { $in: target[targetKey] },
    });

    return (labels.map((label) => label.name) || []).join(', ');
  }

  if (['initialStageId', 'stageId'].includes(targetKey)) {
    const stage = await models.Stages.findOne({
      _id: target[targetKey],
    });

    return (stage && stage.name) || '';
  }

  if (['sourceConversationIds'].includes(targetKey)) {
    const conversations = await sendTRPCMessage({
      pluginName: 'inbox',
      module: 'conversations',
      action: 'find',
      input: { _id: { $in: target[targetKey] } },
    });

    return (conversations.map((c) => c.content) || []).join(', ');
  }

  if (['customers', 'companies'].includes(targetKey)) {
    const relTypeConst = {
      companies: 'company',
      customers: 'customer',
    };

    const contactIds = await sendTRPCMessage({
      pluginName: 'core',
      module: 'conformities',
      action: 'savedConformity',
      input: {
        mainType: 'deal',
        mainTypeId: target._id,
        relTypes: [relTypeConst[targetKey]],
      },
    });

    const upperCasedTargetKey =
      targetKey.charAt(0).toUpperCase() + targetKey.slice(1);

    const activeContacts = await sendTRPCMessage({
      pluginName: 'core',
      module: targetKey,
      action: `findActive${upperCasedTargetKey}`,
      input: { selector: { _id: { $in: contactIds } } },
    });

    if (relatedValueProps && !!relatedValueProps[targetKey]) {
      const { key, filter } = relatedValueProps[targetKey] || {};
      return activeContacts
        .filter((contacts) =>
          filter ? contacts[filter.key] === filter.value : contacts,
        )
        .map((contacts) => contacts[key])
        .join(', ');
    }

    const result = activeContacts.map((contact) => contact?._id).join(', ');
    return result;
  }

  if (targetKey.includes('productsData')) {
    const [_parentFieldName, childFieldName] = targetKey.split('.');

    if (childFieldName === 'amount') {
      return generateTotalAmount(target.productsData);
    }
  }

  if ((targetKey || '').includes('createdBy.')) {
    return await generateCreatedByFieldValue({ subdomain, target, targetKey });
  }

  if (targetKey.includes('customers.')) {
    return await generateCustomersFielValue({ target, targetKey, subdomain });
  }
  if (targetKey.includes('customFieldsData.')) {
    return await generateCustomFieldsDataValue({
      target,
      targetKey,
      subdomain,
    });
  }

  if (targetKey === 'link') {
    const DOMAIN = getEnv({
      name: 'DOMAIN',
    });

    const stage = await models.Stages.getStage(target.stageId);
    const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
    const board = await models.Boards.getBoard(pipeline.boardId);
    return `${DOMAIN}/deal/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${target._id}`;
  }

  if (targetKey === 'pipelineLabels') {
    const labels = await models.PipelineLabels.find({
      _id: { $in: target?.labelIds || [] },
    }).lean();

    return `${labels.map(({ name }) => name).filter(Boolean) || '-'}`;
  }

  if (
    [
      'createdAt',
      'startDate',
      'closeDate',
      'stageChangedDate',
      'modifiedAt',
    ].includes(targetKey)
  ) {
    const dateValue = targetKey[targetKey];
    return moment(dateValue).format('YYYY-MM-DD HH:mm');
  }

  return false;
};

const generateCustomFieldsDataValue = async ({
  targetKey,
  subdomain,
  target,
}: {
  targetKey: string;
  subdomain: string;
  target: any;
}) => {
  const [_, fieldId] = targetKey.split('customFieldsData.');
  const customFieldData = (target?.customFieldsData || []).find(
    ({ field }) => field === fieldId,
  );

  if (!customFieldData) {
    return;
  }

  const field = await sendTRPCMessage({
    pluginName: 'core',
    module: 'fields',
    action: 'findOne',
    input: {
      query: {
        _id: fieldId,
        $or: [
          { type: 'users' },
          { type: 'input', validation: { $in: ['date', 'datetime'] } },
        ],
      },
    },
  });

  if (!field) {
    return;
  }

  if (field?.type === 'users') {
    const users: IUser[] = await sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'find',
      input: {
        query: { _id: { $in: customFieldData?.value || [] } },
        fields: { details: 1 },
      },
      defaultValue: [],
    });

    return users
      .map(
        ({ details }) =>
          `${details?.firstName || ''} ${details?.lastName || ''}`,
      )
      .filter(Boolean)
      .join(', ');
  }
  const isISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(
    customFieldData?.value,
  );

  if (
    field?.type === 'input' &&
    ['date', 'datetime'].includes(field.validation) &&
    isISODate
  ) {
    return moment(customFieldData.value).format('YYYY-MM-DD HH:mm');
  }
};

const generateCustomersFielValue = async ({
  targetKey,
  subdomain,
  target,
}: {
  targetKey: string;
  subdomain: string;
  target: any;
}) => {
  const [_, fieldName] = targetKey.split('.');

  const customerIds = await sendTRPCMessage({
    pluginName: 'core',
    module: 'conformities',
    action: 'savedConformity',
    input: {
      mainType: 'deal',
      mainTypeId: target._id,
      relTypes: ['customer'],
    },
    defaultValue: [],
  });

  const customers: any[] =
    (await sendTRPCMessage({
      pluginName: 'core',
      module: 'customers',
      action: 'find',
      input: { _id: { $in: customerIds } },
      defaultValue: [],
    })) || [];

  if (fieldName === 'email') {
    return customers
      .map((customer) =>
        customer?.primaryEmail
          ? customer?.primaryEmail
          : (customer?.emails || [])[0]?.email,
      )
      .filter(Boolean)
      .join(', ');
  }
  if (fieldName === 'phone') {
    return customers
      .map((customer) =>
        customer?.primaryPhone
          ? customer?.primaryPhone
          : (customer?.phones || [])[0]?.phone,
      )
      .filter(Boolean)
      .join(', ');
  }
  if (fieldName === 'fullName') {
    return customers
      .map(({ firstName = '', lastName = '' }) => `${firstName} ${lastName}`)
      .filter(Boolean)
      .join(', ');
  }
};

const generateCreatedByFieldValue = async ({
  targetKey,
  subdomain,
  target,
}: {
  targetKey: string;
  subdomain: string;
  target: any;
}) => {
  const [_, userField] = targetKey.split('.');
  const user = await sendTRPCMessage({
    pluginName: 'core',
    module: 'users',
    action: 'findOne',
    input: { _id: target?.userId },
  });
  if (userField === 'branch') {
    const branches = await sendTRPCMessage({
      pluginName: 'core',
      module: 'branches',
      action: 'find',
      input: { _id: user?.branchIds || [] },
      defaultValue: [],
    });

    const branch = (branches || [])[0] || {};

    return `${branch?.title || ''}`;
  }
  if (userField === 'department') {
    const departments = await sendTRPCMessage({
      pluginName: 'core',
      module: 'departments',
      action: 'find',
      input: { _id: user?.departmentIds || [] },
      defaultValue: [],
    });

    const department = (departments || [])[0] || {};

    return `${department?.title || ''}`;
  }

  if (userField === 'phone') {
    const { details } = (user || {}) as IUser;

    return `${details?.operatorPhone || ''}`;
  }
  if (userField === 'email') {
    return `${user?.email || '-'}`;
  }
};

const generateTotalAmount = (productsData) => {
  let totalAmount = 0;

  (productsData || []).forEach((product) => {
    if (product.tickUsed) {
      return;
    }

    totalAmount += product?.amount || 0;
  });

  return totalAmount;
};
