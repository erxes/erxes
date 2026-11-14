import {
  buildSkippedAction,
  IAutomationAction,
  IAutomationExecution,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { getEnv } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { readFormLinkDays, signFormLink } from '@/form/formLink';
import { IModels } from '~/connectionResolvers';

const DAY = 24 * 60 * 60 * 1000;

export type TCreateFormLinkResult = {
  url: string;
  expiresAt: Date;
  linkId: string;
  formId: string;
};

type TLinkTarget = {
  _id?: string;
  customerId?: string;
  customerIds?: string[];
};

// A trigger type may carry its relation (`frontline:tickets.tickets.sla`); the record is the first two parts.
export const recordTypeOf = (triggerType?: string) =>
  triggerType ? triggerType.split('.').slice(0, 2).join('.') : undefined;

const readCustomerId = (target: TLinkTarget) =>
  target.customerId ||
  (Array.isArray(target.customerIds) ? target.customerIds[0] : undefined) ||
  undefined;

/**
 * A personal link to a form, made for the run's record: the answer is saved as
 * about that record and from that record's customer, and the link takes one
 * answer before it expires.
 */
export const executeCreateFormLinkAction = async ({
  models,
  subdomain,
  action,
  execution,
  now = new Date(),
}: {
  models: IModels;
  subdomain: string;
  action: IAutomationAction;
  execution: IAutomationExecution;
  now?: Date;
}): Promise<TCreateFormLinkResult | ReturnType<typeof buildSkippedAction>> => {
  const config = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  });
  const formId = String(config.formId || '').trim();
  const form = formId
    ? await models.Forms.findOne({ _id: formId }, { channelId: 1 }).lean()
    : null;

  // The live form page is addressed by channel.
  if (!form?.channelId) {
    return buildSkippedAction('form-not-found', { formId });
  }

  const target = (execution.target || {}) as TLinkTarget;
  const days = readFormLinkDays(config.expiresInDays);
  const linkId = nanoid();
  const recordType = recordTypeOf(execution.triggerType);
  const token = signFormLink(
    {
      linkId,
      formId: form._id,
      customerId: readCustomerId(target),
      aboutRecord:
        target._id && recordType
          ? { type: recordType, id: String(target._id) }
          : undefined,
    },
    days,
  );
  const widgetsDomain = String(
    getEnv({
      name: 'WIDGETS_DOMAIN',
      subdomain,
      defaultValue: 'http://localhost:3200',
    }),
  ).replace(/\/+$/, '');

  return {
    url: `${widgetsDomain}/live/${form.channelId}/${form._id}?t=${encodeURIComponent(token)}`,
    expiresAt: new Date(now.getTime() + days * DAY),
    linkId,
    formId: form._id,
  };
};
