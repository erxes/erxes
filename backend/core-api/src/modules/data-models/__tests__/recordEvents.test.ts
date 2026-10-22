import type {
  EventDispatcherReturn,
  ScopedEventHandlers,
} from 'erxes-api-shared/core-modules';
import { createDataModelRecordEvents } from '../records/events';
import type { IDataModelRecord } from '../records/types';

it('uses the platform event dispatcher with model-specific content identity and snapshots', () => {
  const sendDbEventLog = jest.fn<
    ReturnType<EventDispatcherReturn['sendDbEventLog']>,
    Parameters<EventDispatcherReturn['sendDbEventLog']>
  >();
  const dispatcher: EventDispatcherReturn = {
    sendDbEventLog,
    sendAutomationTriggerTarget: jest.fn(),
    createActivityLog: jest.fn(),
    sendNotificationMessage: jest.fn(),
    getContext: () => ({ subdomain: 'tenant', userId: 'actor' }),
  };
  const scope = jest.fn(() => dispatcher);
  const eventHandlers: ScopedEventHandlers = (pluginName) => {
    expect(pluginName).toBe('core');
    return scope;
  };
  const emit = createDataModelRecordEvents(eventHandlers);
  const current: IDataModelRecord = {
    _id: 'record',
    dataModelId: 'a',
    propertiesData: { title: 'New' },
    version: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'actor',
    updatedBy: 'actor',
    deletedAt: null,
    deletedBy: null,
  };
  const previous = { ...current, propertiesData: { title: 'Old' }, version: 1 };
  emit('a', { action: 'create', current });
  emit('a', { action: 'update', previous, current });
  emit('a', { action: 'delete', previous, current });
  expect(scope).toHaveBeenCalledWith('dataModels', 'data_model_records_a');
  expect(sendDbEventLog.mock.calls.map(([event]) => event)).toEqual([
    { action: 'create', docId: 'record', currentDocument: current },
    {
      action: 'update',
      docId: 'record',
      currentDocument: current,
      prevDocument: previous,
    },
    { action: 'delete', docId: 'record', prevDocument: previous },
  ]);
});
