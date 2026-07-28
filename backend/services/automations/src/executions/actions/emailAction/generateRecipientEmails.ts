import { generateAttributesFromPlaceholders } from '../../../utils/utils';
import {
  IAutomationExecutionDocument,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { extractValidEmails, normalizeEmailActionPlaceholders } from './utils';

export const getRecipientEmails = async ({
  subdomain,
  config,
  execution,
  targetType,
}) => {
  const commonProps = {
    subdomain,
    execution,
    targetType,
  };

  const toEmails = [
    ...(await collectEmails(config.toEmailsPlaceHolders, commonProps)),
  ];
  const ccEmails = config?.ccEmailsPlaceHolders
    ? [
        ...(await collectEmails(
          config?.ccEmailsPlaceHolders || '',
          commonProps,
        )),
      ]
    : [];

  return [toEmails, ccEmails];
};

export const collectEmails = async (
  mailPlaceHolder: string,
  {
    subdomain,
    execution,
    targetType,
  }: {
    subdomain: string;
    execution: IAutomationExecutionDocument;
    targetType: string;
  },
) => {
  const normalizedMailPlaceHolder = normalizeEmailActionPlaceholders(
    mailPlaceHolder,
    targetType,
  );
  const directEmails = extractValidEmails(normalizedMailPlaceHolder);
  const attributes = generateAttributesFromPlaceholders(
    normalizedMailPlaceHolder,
  );
  if (!attributes.length) return directEmails;

  const replacedContent = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { mailPlaceHolder: normalizedMailPlaceHolder },
  });

  const generatedEmails = extractValidEmails(
    String(replacedContent.mailPlaceHolder || ''),
  );

  return [...new Set([...directEmails, ...generatedEmails])];
};
