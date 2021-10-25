import { IExecution } from '../models/Executions';
import { sendRequest } from 'erxes-api-utils';
import { sendRPCMessage } from '../messageBroker';

const createObjectWrapper = (execution: IExecution, doc: any, model: string, type: string, channel?: string) => {
  const conformityTypes = ['deal', 'task', 'ticket', 'customer', 'company']
  if (
    model.toLowerCase() !== execution.triggerType &&
    conformityTypes.includes(execution.triggerType) &&
    conformityTypes.includes(type)
  ) {
    doc.conformity = {
      mainType: execution.triggerType,
      mainTypeId: execution.targetId,
      relType: model.toLowerCase()
    }
  }

  if (execution.triggerType === 'conversation' && ['deal', 'task', 'ticket'].includes(model)) {
    doc.sourceConversationIds = [execution.targetId]
  }

  return sendRPCMessage(channel || 'add-object', { ...doc, model, type });
}

export const getContext = async (execution: IExecution) => {
  return {
    tag: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Tags`, call: 'getTag', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Tags`, selector })),
    },
    contact: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Customers`, call: 'getCustomer', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Customers`, selector })),
      associations: (relType, mainTypeId?, model?) => (sendRPCMessage('find-conformities', { mainType: 'customer', mainTypeId: mainTypeId || execution.target._id, relType, model })),
      createObject: (doc) => (createObjectWrapper(execution, doc, 'Customers', 'customer')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (sendRPCMessage('set-conformities', { mainType: 'customer', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Customers' })),
      removeItem: (ids) => (sendRPCMessage('remove-objects', { model: 'Customers', call: 'removeCustomers', ids })),
    },
    company: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Companies`, call: 'getCompany', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Companies`, selector })),
      associations: (relType, mainTypeId?) => (sendRPCMessage('find-conformities', { mainType: 'company', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper(execution, doc, 'Companies', 'company')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (sendRPCMessage('set-conformities', { mainType: 'company', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Companies' })),
      removeItem: (ids) => (sendRPCMessage('remove-objects', { model: 'Companies', call: 'removeCompanies', ids })),
    },
    deal: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Deals`, call: 'getDeal', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Deals`, selector })),
      associations: (relType, mainTypeId?) => (sendRPCMessage('find-conformities', { mainType: 'deal', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper(execution, doc, 'Deals', 'deal', 'add-deal')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (sendRPCMessage('set-conformities', { mainType: 'deal', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Deals' })),
      removeItem: (ids) => (sendRPCMessage('remove-deal', { model: 'Deals', call: 'removeDeals', ids })),
    },
    task: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Tasks`, call: 'getTask', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Tasks`, selector })),
      associations: (relType, mainTypeId?) => (sendRPCMessage('find-conformities', { mainType: 'task', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper(execution, doc, 'Tasks', 'task', 'add-task')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (sendRPCMessage('set-conformities', { mainType: 'task', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Tasks' })),
      removeItem: (ids) => (sendRPCMessage('remove-task', { model: 'Tasks', call: 'removeTasks', ids })),
    },
    ticket: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Tickets`, call: 'getTicket', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Tickets`, selector })),
      associations: (relType, mainTypeId?) => (sendRPCMessage('find-conformities', { mainType: 'ticket', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper(execution, doc, 'Tickets', 'ticket', 'add-ticket')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (sendRPCMessage('set-conformities', { mainType: 'ticket', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Tickets' })),
      removeItem: (ids) => (sendRPCMessage('remove-ticket', { model: 'Tickets', call: 'removeTickets', ids })),
    },
    conversation: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Conversations`, call: 'getConversation', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Conversations`, selector })),
      setProperty: (doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Conversations' })),
    },
    teamMember: {
      getObject: (id) => (sendRPCMessage('get-object', { model: `Users`, call: 'getUser', id })),
      findObjects: (selector) => (sendRPCMessage('find-objects', { model: `Users`, selector })),
      setProperty: (doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Users' })),
    },
    notification: {

    },
    request: {
      sendRequest: ({ url, method, headers, form, body, params }) => {
        return sendRequest({ url, method, headers, form, body, params });
      }
    },
    plugins: {
      getObject: (model, id) => (sendRPCMessage('get-object', { model, id })),
      findObjects: (model, selector) => (sendRPCMessage('find-objects', { model, selector })),
      setProperty: (model, doc, id?) => (sendRPCMessage('set-property', { ...doc, _id: doc._id || id || execution.target._id, model })),
    }
  }
}
