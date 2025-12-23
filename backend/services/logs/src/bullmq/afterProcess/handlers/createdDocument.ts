import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import { HandlerContext, isCreateDocumentRule } from '../types';
import { sendProducer, shouldProcessCreateDocument } from '../utils';

export function handleCreateDocument(context: HandlerContext): void {
  if (!isCreateDocumentRule(context.rule)) {
    return;
  }

  if (shouldProcessCreateDocument(context.rule, context, context.payload)) {
    sendProducer(context, TAfterProcessProducers.AFTER_DOCUMENT_CREATED, {
      ...context.payload,
      contentType: context.contentType,
    });
  }
}
