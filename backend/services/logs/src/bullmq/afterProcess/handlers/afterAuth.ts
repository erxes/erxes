import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isAfterAuthRule } from '../types';
import { sendProducer } from '../utils';

export function handleAfterAuth(context: HandlerContext): void {
  if (!isAfterAuthRule(context.rule)) {
    return;
  }

  const { types = [] } = context.rule;

  if (types.includes(context.action)) {
    sendProducer(context, TAfterProcessProducers.AFTER_AUTH, {
      processId: context.payload.processId,
      userId: context.payload.userId,
      email: context.payload.email,
      result: context.payload.result,
    });
  }
}

