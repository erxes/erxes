import type { ScopedEventHandlers } from 'erxes-api-shared/core-modules';
import { dataModelRecordCollectionName } from './identity';
import type { DataModelRecordEventSink } from './types';

export const createDataModelRecordEvents =
  (eventHandlers: ScopedEventHandlers): DataModelRecordEventSink =>
  (modelId, event) => {
    const { sendDbEventLog } = eventHandlers('core')(
      'dataModels',
      dataModelRecordCollectionName(modelId),
    );
    if (event.action === 'create') {
      sendDbEventLog({
        action: 'create',
        docId: event.current._id,
        currentDocument: event.current,
      });
    } else if (event.action === 'delete') {
      sendDbEventLog({
        action: 'delete',
        docId: event.current._id,
        prevDocument: event.previous,
      });
    } else {
      sendDbEventLog({
        action: 'update',
        docId: event.current._id,
        currentDocument: event.current,
        prevDocument: event.previous,
      });
    }
  };
