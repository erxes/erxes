import { IAfterProcessRule, TAfterProcessRule } from 'erxes-api-shared/utils';
import { AfterProcessProps } from '~/types';

export interface AfterProcessContext {
  subdomain: string;
  pluginName: string;
  source: AfterProcessProps['source'];
  action: string;
  payload: any;
  contentType?: string;
}

export interface HandlerContext extends AfterProcessContext {
  rule: IAfterProcessRule;
}

export type RuleMatcher = (
  rule: IAfterProcessRule,
  context: AfterProcessContext,
) => boolean;

export type RuleHandler = (context: HandlerContext) => void | Promise<void>;

export interface RuleHandlerConfig {
  matcher: RuleMatcher;
  handler: RuleHandler;
}

export type AfterMutationRule = TAfterProcessRule['AfterMutation'];
export type CreateDocumentRule = TAfterProcessRule['CreateDocument'];
export type UpdatedDocumentRule = TAfterProcessRule['UpdatedDocument'];
export type AfterAPIRequestRule = TAfterProcessRule['AfterAPIRequest'];
export type AfterAuthRule = TAfterProcessRule['AfterAuth'];

export function isAfterMutationRule(
  rule: IAfterProcessRule,
): rule is AfterMutationRule {
  return rule.type === 'afterMutation';
}

export function isCreateDocumentRule(
  rule: IAfterProcessRule,
): rule is CreateDocumentRule {
  return rule.type === 'createdDocument';
}

export function isUpdatedDocumentRule(
  rule: IAfterProcessRule,
): rule is UpdatedDocumentRule {
  return rule.type === 'updatedDocument';
}

export function isAfterAPIRequestRule(
  rule: IAfterProcessRule,
): rule is AfterAPIRequestRule {
  return rule.type === 'afterAPIRequest';
}

export function isAfterAuthRule(
  rule: IAfterProcessRule,
): rule is AfterAuthRule {
  return rule.type === 'afterAuth';
}
