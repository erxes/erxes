import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isAfterMutationRule } from '../types';
import { sendProducer } from '../utils';

export async function handleAfterMutation(
  context: HandlerContext,
): Promise<void> {
  if (!isAfterMutationRule(context.rule)) {
    return;
  }

  const { mutationNames = [] } = context.rule;
  const { mutationName } = context.payload || {};

  if (mutationNames.includes(mutationName)) {
    await sendProducer(
      context,
      TAfterProcessProducers.AFTER_MUTATION,
      context.payload,
    );
  }
}
