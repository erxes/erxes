import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isAfterMutationRule } from '../types';
import { sendProducer } from '../utils';

export function handleAfterMutation(context: HandlerContext): void {
  if (!isAfterMutationRule(context.rule)) {
    return;
  }

  const { mutationNames = [] } = context.rule;
  const { mutationName } = context.payload || {};

  if (mutationNames.includes(mutationName)) {
    sendProducer(
      context,
      TAfterProcessProducers.AFTER_MUTATION,
      context.payload,
    );
  }
}
