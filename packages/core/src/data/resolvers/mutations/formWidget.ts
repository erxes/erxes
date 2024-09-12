import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { IContext, IModels } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const groupSubmissions = (submissions: any[]) => {
  const submissionsGrouped: { [key: string]: any[] } = {};

  submissions.forEach(submission => {
    if (submission.groupId) {
      if (submissionsGrouped[submission.groupId]) {
        submissionsGrouped[submission.groupId].push(submission);
      } else {
        submissionsGrouped[submission.groupId] = [submission];
      }
    } else {
      if (submissionsGrouped.default) {
        submissionsGrouped.default.push(submission);
      } else {
        submissionsGrouped.default = [submission];
      }
    }
  });
  return submissionsGrouped;
};

export const solveSubmissions = async (
  models: IModels,
  subdomain: string,
  args: {
    integrationId: string;
    formId: string;
    submissions;
    browserInfo: any;
    cachedCustomerId?: string;
  }
) => {
  const { cachedCustomerId } = args;
  const { integrationId, browserInfo } = args;
  const integration: any = await models.Integrations.findOne({
    _id: integrationId
  });

  const submissionsGrouped = groupSubmissions(args.submissions);

  return sendContactsMessage({
    subdomain,
    action: "updateContactsField",
    data: {
      cachedCustomerId,
      browserInfo,
      integration,
      submissionsGrouped,
      prepareCustomFieldsData: true
    },
    isRPC: true,
    defaultValue: {}
  });
};

export const createFormConversation = async (
  models: IModels,
  subdomain: string,
  args: {
    formId: string;
    submissions: any[];
    browserInfo: any;
    cachedCustomerId?: string;
    userId?: string;
  },
  generateContent: (form) => string,
  generateConvData: () => {
    conversation?: any;
    message: any;
  },
  type?: string
) => {
  const { formId, submissions } = args;

  const form = await models.Forms.findOne({_id: formId}).lean();

  if (!form) {
    throw new Error("Form not found");
  }

  const errors =await models.Forms.validateForm(formId, submissions)

  if (errors.length > 0) {
    return { status: "error", errors };
  }

  const content = await generateContent(form);

  const cachedCustomer = await solveSubmissions(models, subdomain, {...args, integrationId: form.integrationId || ''});

  const conversationData = await generateConvData();

  // create conversation
  const conversation = await models.Conversations.createConversation({
    integrationId,
    customerId: cachedCustomer._id,
    content,
    ...conversationData.conversation
  });

  // create message
  const message = await models.ConversationMessages.createMessage({
    conversationId: conversation._id,
    customerId: cachedCustomer._id,
    content,
    ...conversationData.message
  });

  await pConversationClientMessageInserted(models, subdomain, message);

  graphqlPubsub.publish(
    `conversationMessageInserted:${message.conversationId}`,
    {
      conversationMessageInserted: message
    }
  );

  if (type === "lead") {
    // increasing form submitted count
    await models.Integrations.increaseContactsGathered(formId);

    const formData = {
      formId: args.formId,
      submissions: args.submissions,
      customer: cachedCustomer,
      cachedCustomerId: cachedCustomer._id,
      conversationId: conversation._id
    };

    // await sendToWebhook({
    //   subdomain,
    //   data: {
    //     action: "create",
    //     type: "inbox:popupSubmitted",
    //     params: formData
    //   }
    // });
  }

  const docs: any[] = [];
  for (const submission of submissions) {
    let value: any = submission.value || "";

    if (submission.validation === "number") {
      value = Number(submission.value);
    }

    if (
      submission.validation &&
      ["datetime", "date"].includes(submission.validation)
    ) {
      value = new Date(submission.value);
    }

    docs.push({
      contentTypeId: conversation._id,
      contentType: type,
      formFieldId: submission._id,
      formId,
      value,
      customerId: cachedCustomer._id,
      userId: args.userId
    });
  }

  await sendCoreMessage({
    subdomain,
    action: "submissions.createFormSubmission",
    data: {
      submissions: docs
    },
    isRPC: false
  });

  // automation trigger =========
  if (cachedCustomer) {
    const submissionValues = {};

    for (const submit of submissions) {
      submissionValues[submit._id] = submit.value;
    }

    sendAutomationsMessage({
      subdomain,
      action: "trigger",
      data: {
        type: `core:${cachedCustomer.state}`,
        targets: [
          {
            ...cachedCustomer,
            ...submissionValues,
            isFormSubmission: true,
            conversationId: conversation._id,
            userId: args.userId
          }
        ]
      }
    });
  }

  return {
    status: "ok",
    conversationId: conversation._id,
    customerId: cachedCustomer._id
  };
};

const mutations = {
  async widgetsLeadConnect(
    _root,
    args: { brandCode: string; formCode: string; cachedCustomerId?: string },
    { models, subdomain }: IContext
  ) {
    const brand = await models.Brands.findOne({ code: args.brandCode }).lean();

    const form = await models.Forms.findOne({ code: args.formCode }).lean();

    if (!brand || !form) {
      throw new Error('Invalid configuration');
    }

    // find integration by brandId & formId
    // const integ = await models.Integrations.getIntegration({
    //   brandId: brand._id,
    //   formId: form._id,
    //   isActive: true,
    // });
    let integration = null;

    if (isEnabled('inbox') && form.integrationId) {
      integration = await sendCommonMessage({
        serviceName: 'inbox',
        action: 'integrations.findOne',
        data: {
          _id: form.integrationId,
        },
        isRPC: true,
        defaultValue: null,
        subdomain,
      });
    }

    // if (integ.leadData && integ.leadData.loadType === 'embedded') {
    //   await models.Integrations.increaseViewCount(form._id);
    // }

    // if (integ.createdUserId) {
    //   const user = await sendCoreMessage({
    //     subdomain,
    //     action: 'users.findOne',
    //     data: {
    //       _id: integ.createdUserId,
    //     },
    //     isRPC: true,
    //     defaultValue: {},
    //   });

    //   await sendCoreMessage({
    //     subdomain,
    //     action: 'registerOnboardHistory',
    //     data: {
    //       type: 'leadIntegrationInstalled',
    //       user,
    //     },
    //   });
    // }

    if (form.leadData?.isRequireOnce && args.cachedCustomerId) {
      //   const conversation = await models.Conversations.findOne({
      //     customerId: args.cachedCustomerId,
      //     integrationId: integ._id,
      //   });
      //   if (conversation) {
      //     return null;
      //   }
    }

    // return integration details
    return {
      integration,
      form,
    };
  },

  async widgetsSaveLead(
    _root,
    args: {
      formId: string;
      submissions: any[];
      browserInfo: any;
      cachedCustomerId?: string;
      userId?: string;
    },
    { models, subdomain, user }: IContext
  ) {
    const { submissions } = args;

    return createFormConversation(
      models,
      subdomain,
      {
        ...args,
        userId: args.userId || user ? user._id : ""
      },
      form => {
        return form.title;
      },
      () => {
        return {
          message: {
            formWidgetData: submissions
          }
        };
      },
      "lead"
    );
  },
};

export default mutations;
