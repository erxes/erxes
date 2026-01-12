import {
  AfterProcessContext,
  RuleHandlerConfig,
  RuleMatcher,
} from './types';
import { IAfterProcessRule } from 'erxes-api-shared/utils';
import { handleAfterMutation } from './handlers/afterMutation';
import { handleUpdatedDocument } from './handlers/updatedDocument';
import { handleCreateDocument } from './handlers/createdDocument';
import { handleAfterAPIRequest } from './handlers/afterAPIRequest';
import { handleAfterAuth } from './handlers/afterAuth';

const createDocumentMatcher: RuleMatcher = (rule, context) => {
  return (
    rule.type === 'createdDocument' &&
    context.source === 'mongo' &&
    context.action === 'create'
  );
};

const updatedDocumentMatcher: RuleMatcher = (rule, context) => {
  return (
    rule.type === 'updatedDocument' &&
    context.source === 'mongo' &&
    context.action === 'update'
  );
};

const afterAPIRequestMatcher: RuleMatcher = (rule) => {
  return rule.type === 'afterAPIRequest';
};

const afterAuthMatcher: RuleMatcher = () => {
  return true;
};

const afterMutationMatcher: RuleMatcher = () => {
  return true;
};

export const handlerRegistry: Record<
  string,
  RuleHandlerConfig
> = {
  createdDocument: {
    matcher: createDocumentMatcher,
    handler: handleCreateDocument,
  },
  updatedDocument: {
    matcher: updatedDocumentMatcher,
    handler: handleUpdatedDocument,
  },
  afterAPIRequest: {
    matcher: afterAPIRequestMatcher,
    handler: handleAfterAPIRequest,
  },
  afterAuth: {
    matcher: afterAuthMatcher,
    handler: handleAfterAuth,
  },
  afterMutation: {
    matcher: afterMutationMatcher,
    handler: handleAfterMutation,
  },
};

export function findMatchingHandler(
  rule: IAfterProcessRule,
  context: AfterProcessContext,
): RuleHandlerConfig | null {
  const config = handlerRegistry[rule.type];
  if (!config) {
    return null;
  }

  return config.matcher(rule, context) ? config : null;
}

