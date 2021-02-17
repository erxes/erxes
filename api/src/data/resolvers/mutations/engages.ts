import * as _ from 'underscore';
import { Customers, EngageMessages, Users } from '../../../db/models';
import { METHODS } from '../../../db/models/definitions/constants';
import { IEngageMessage } from '../../../db/models/definitions/engages';
import { MESSAGE_KINDS, MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import {
  registerOnboardHistory,
  replaceEditorAttributes,
  sendToWebhook
} from '../../utils';
import { send } from './engageUtils';

interface IEngageMessageEdit extends IEngageMessage {
  _id: string;
}

interface ITestEmailParams {
  from: string;
  to: string;
  content: string;
  title: string;
}

/**
 * These fields contain too much data & it's inappropriate
 * to save such data in each log row
 */
const emptyCustomers = {
  customerIds: [],
  messengerReceivedCustomerIds: []
};

const engageMutations = {
  /**
   * Create new message
   */
  async engageMessageAdd(
    _root,
    doc: IEngageMessage,
    { user, docModifier }: IContext
  ) {
    if (doc.kind !== MESSAGE_KINDS.MANUAL && doc.method === METHODS.SMS) {
      throw new Error(
        `SMS engage message of kind ${doc.kind} is not supported`
      );
    }

    // fromUserId is not required in sms engage, so set it here
    if (!doc.fromUserId) {
      doc.fromUserId = user._id;
    }

    const engageMessage = await EngageMessages.createEngageMessage(
      docModifier({ ...doc, createdBy: user._id })
    );

    await sendToWebhook('create', 'engageMessages', engageMessage);

    await send(engageMessage);

    await putCreateLog(
      {
        type: MODULE_NAMES.ENGAGE,
        newData: {
          ...doc,
          ...emptyCustomers
        },
        object: {
          ...engageMessage.toObject(),
          ...emptyCustomers
        }
      },
      user
    );

    return engageMessage;
  },

  /**
   * Edit message
   */
  async engageMessageEdit(
    _root,
    { _id, ...doc }: IEngageMessageEdit,
    { user }: IContext
  ) {
    const engageMessage = await EngageMessages.getEngageMessage(_id);
    const updated = await EngageMessages.updateEngageMessage(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.ENGAGE,
        object: { ...engageMessage.toObject(), ...emptyCustomers },
        newData: { ...updated.toObject(), ...emptyCustomers },
        updatedDocument: updated
      },
      user
    );

    return EngageMessages.findOne({ _id });
  },

  /**
   * Remove message
   */
  async engageMessageRemove(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const engageMessage = await EngageMessages.getEngageMessage(_id);

    const removed = await EngageMessages.removeEngageMessage(_id);

    await putDeleteLog(
      {
        type: MODULE_NAMES.ENGAGE,
        object: { ...engageMessage.toObject(), ...emptyCustomers }
      },
      user
    );

    return removed;
  },

  /**
   * Engage message set live
   */
  engageMessageSetLive(_root, { _id }: { _id: string }) {
    return EngageMessages.engageMessageSetLive(_id);
  },

  /**
   * Engage message set pause
   */
  engageMessageSetPause(_root, { _id }: { _id: string }) {
    return EngageMessages.engageMessageSetPause(_id);
  },

  /**
   * Engage message set live manual
   */
  async engageMessageSetLiveManual(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const draftCampaign = await EngageMessages.getEngageMessage(_id);
    const live = await EngageMessages.engageMessageSetLive(_id);

    await send(live);

    await putUpdateLog(
      {
        type: MODULE_NAMES.ENGAGE,
        newData: {
          isLive: true,
          isDraft: false
        },
        object: {
          _id,
          isLive: draftCampaign.isLive,
          isDraft: draftCampaign.isDraft
        },
        description: `Campaign "${draftCampaign.title}" has been set live`
      },
      user
    );

    return live;
  },

  engagesUpdateConfigs(_root, configsMap, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engagesUpdateConfigs(configsMap);
  },

  /**
   * Engage message verify email
   */
  async engageMessageVerifyEmail(
    _root,
    { email }: { email: string },
    { dataSources, user }: IContext
  ) {
    await registerOnboardHistory({ type: 'engageVerifyEmail', user });

    return dataSources.EngagesAPI.engagesVerifyEmail({ email });
  },

  /**
   * Engage message remove verified email
   */
  engageMessageRemoveVerifiedEmail(
    _root,
    { email }: { email: string },
    { dataSources }: IContext
  ) {
    return dataSources.EngagesAPI.engagesRemoveVerifiedEmail({ email });
  },

  async engageMessageSendTestEmail(
    _root,
    args: ITestEmailParams,
    { dataSources, user }: IContext
  ) {
    await registerOnboardHistory({ type: 'engageSendTestEmail', user });

    const { content, from, to, title } = args;

    if (!(content && from && to && title)) {
      throw new Error(
        'Email content, title, from address or to address is missing'
      );
    }

    const customer = await Customers.findOne({ primaryEmail: to });
    const targetUser = await Users.findOne({ email: to });

    const { replacedContent } = await replaceEditorAttributes({
      content,
      customer,
      user: targetUser
    });

    return dataSources.EngagesAPI.engagesSendTestEmail({
      ...args,
      content: replacedContent
    });
  },

  // Helps users fill less form fields to create a campaign
  async engageMessageCopy(
    _root,
    { _id }: { _id },
    { docModifier, user }: IContext
  ) {
    const sourceCampaign = await EngageMessages.getEngageMessage(_id);

    const doc = docModifier({
      ...sourceCampaign.toObject(),
      createdAt: new Date(),
      createdBy: user._id,
      title: `${sourceCampaign.title}-copied`,
      isDraft: true,
      isLive: false
    });

    delete doc._id;

    if (doc.scheduleDate) {
      // schedule date should be manually set
      delete doc.scheduleDate;
    }

    const copy = await EngageMessages.createEngageMessage(doc);

    await putCreateLog(
      {
        type: MODULE_NAMES.ENGAGE,
        newData: {
          ...doc,
          ...emptyCustomers
        },
        object: {
          ...copy.toObject(),
          ...emptyCustomers
        },
        description: `Campaign "${sourceCampaign.title}" has been copied`
      },
      user
    );

    return copy;
  }
};

checkPermission(engageMutations, 'engageMessageAdd', 'engageMessageAdd');
checkPermission(engageMutations, 'engageMessageEdit', 'engageMessageEdit');
checkPermission(engageMutations, 'engageMessageRemove', 'engageMessageRemove');
checkPermission(
  engageMutations,
  'engageMessageSetLive',
  'engageMessageSetLive'
);
checkPermission(
  engageMutations,
  'engageMessageSetPause',
  'engageMessageSetPause'
);
checkPermission(
  engageMutations,
  'engageMessageSetLiveManual',
  'engageMessageSetLiveManual'
);
checkPermission(
  engageMutations,
  'engageMessageVerifyEmail',
  'engageMessageRemove'
);
checkPermission(
  engageMutations,
  'engageMessageRemoveVerifiedEmail',
  'engageMessageRemove'
);
checkPermission(
  engageMutations,
  'engageMessageSendTestEmail',
  'engageMessageRemove'
);
checkPermission(engageMutations, 'engageMessageCopy', 'engageMessageAdd');

export default engageMutations;
