import { getConfig } from '@/organization/settings/utils/configs';
import { IEmailParams } from '@/organization/types';
import {
  deliverEmail,
  getEnv,
  loadEmailProviderConfig,
} from 'erxes-api-shared/utils';
import * as Handlebars from 'handlebars';
import { IModels } from '~/connectionResolvers';
import { applyTemplate } from '~/utils/common';
import { createDeliveryLogPort } from '~/utils/email/deliveryLog';

export const sendEmail = async (
  subdomain: string,
  params: IEmailParams,
  models?: IModels,
) => {
  const {
    toEmails = [],
    fromEmail,
    title,
    customHtml,
    customHtmlData,
    template = {},
    modifier,
    attachments,
    getOrganizationDetail,
    transportMethod,
    userId,
  } = params;

  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  // do not send email it is running in test mode
  if (NODE_ENV === 'test') {
    return;
  }

  const defaultTemplate = await getConfig('COMPANY_EMAIL_TEMPLATE', '', models);
  const defaultTemplateType = await getConfig(
    'COMPANY_EMAIL_TEMPLATE_TYPE',
    '',
    models,
  );
  const COMPANY_EMAIL_FROM = await getConfig('COMPANY_EMAIL_FROM', '', models);

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const VERSION = getEnv({ name: 'VERSION' });

  const providerConfig = await loadEmailProviderConfig((code, defaultValue) =>
    getConfig(code, defaultValue, models),
  );

  // SaaS has always gone out through SendGrid regardless of the tenant's
  // configured provider, and callers can still force it per message.
  if (transportMethod === 'sendgrid' || VERSION === 'saas') {
    providerConfig.DEFAULT_EMAIL_SERVICE = 'sendgrid';
  }

  const { data = {}, name } = template;

  // for unsubscribe url
  data.domain = DOMAIN;

  let hasCompanyFromEmail = COMPANY_EMAIL_FROM && COMPANY_EMAIL_FROM.length > 0;

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

  const log = models ? createDeliveryLogPort(models) : undefined;

  for (const toEmail of toEmails) {
    if (modifier) {
      await modifier(data, toEmail);
    }

    // generate email content by given template
    let html;

    if (name) {
      html = await applyTemplate(data, name);
    } else if (
      !defaultTemplate ||
      !defaultTemplateType ||
      defaultTemplateType?.toString() === 'simple'
    ) {
      html = await applyTemplate(data, 'base');
    } else if (defaultTemplate) {
      html = Handlebars.compile(defaultTemplate.toString())(data || {});
    }

    if (customHtml) {
      html = Handlebars.compile(customHtml)(customHtmlData || {});
    }

    const from =
      fromEmail ||
      (hasCompanyFromEmail
        ? `Noreply <${COMPANY_EMAIL_FROM}>`
        : 'noreply@erxes.io');

    if (!from) {
      throw new Error(`"From" email address is missing: ${from}`);
    }

    try {
      await deliverEmail({
        cacheKey: subdomain,
        config: providerConfig,
        message: {
          from,
          to: [toEmail],
          subject: title || '',
          html: html || '',
          attachments: (attachments || []).map((attachment: any) => ({
            filename: attachment.filename || attachment.name || '',
            path: attachment.path || attachment.url,
            content: attachment.content,
            contentType: attachment.contentType || attachment.type,
          })),
        },
        log,
        meta: {
          source: 'transactional',
          userId,
        },
      });

      console.log(`Email sent successfully: ${toEmail} from ${from}`);
    } catch (e) {
      console.log(`Error sending email: ${e.message}`);
    }
  }
};
