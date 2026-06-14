import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isAfterAPIRequestRule } from '../types';
import { sendProducer } from '../utils';

export async function handleAfterAPIRequest(
  context: HandlerContext,
): Promise<void> {
  if (!isAfterAPIRequestRule(context.rule)) {
    return;
  }

  const { paths = [] } = context.rule;
  const { path } = context.payload || {};

  if (paths.includes(path)) {
    await sendProducer(
      context,
      TAfterProcessProducers.AFTER_API_REQUEST,
      context.payload,
    );
  }
}
