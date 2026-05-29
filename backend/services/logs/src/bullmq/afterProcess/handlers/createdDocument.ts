import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isCreateDocumentRule } from '../types';
import { sendProducer, shouldProcessCreateDocument } from '../utils';

export async function handleCreateDocument(
  context: HandlerContext,
): Promise<void> {
  if (!isCreateDocumentRule(context.rule)) {
    return;
  }

  if (shouldProcessCreateDocument(context.rule, context, context.payload)) {
    await sendProducer(context, TAfterProcessProducers.AFTER_DOCUMENT_CREATED, {
      ...context.payload,
      contentType: context.contentType,
    });
  }
}
