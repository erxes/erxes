import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isUpdatedDocumentRule } from '../types';
import { sendProducer, shouldProcessUpdatedDocument } from '../utils';

export async function handleUpdatedDocument(
  context: HandlerContext,
): Promise<void> {
  if (!isUpdatedDocumentRule(context.rule)) {
    return;
  }

  if (
    shouldProcessUpdatedDocument(context.rule, context, context.payload)
  ) {
    await sendProducer(context, TAfterProcessProducers.AFTER_DOCUMENT_UPDATED, {
      ...context.payload,
      contentType: context.contentType,
    });
  }
}
