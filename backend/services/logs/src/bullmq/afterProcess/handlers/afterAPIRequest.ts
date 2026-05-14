import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isAfterAPIRequestRule } from '../types';
import { sendProducer } from '../utils';

export function handleAfterAPIRequest(context: HandlerContext): void {
  if (!isAfterAPIRequestRule(context.rule)) {
    return;
  }

  const { paths = [] } = context.rule;
  const { path } = context.payload || {};

  if (paths.includes(path)) {
    sendProducer(
      context,
      TAfterProcessProducers.AFTER_API_REQUEST,
      context.payload,
    );
  }
}

