import { IExecution } from '../models/Executions';
import { sendRequest } from 'erxes-api-utils';
import { sendRPCMessage } from '../messageBroker';

const apiWrapper = async (kind, channel, data, result, isMutation=false) => {
  try {
    const response = await sendRPCMessage(channel, data)
    if (isMutation) {
      result.push({ kind, data, response })
    }

    if (response.error) {
      throw ({message: `subAction: ${kind}, error: ${response.error}`, result})
    }

    return response;
  } catch (e) {
    throw ({message: e.message, result})
  }
}

const createObjectWrapper = (kind, execution: IExecution, doc: any, model: string, call: string, type: string, result, channel?: string) => {
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

  return apiWrapper(kind, channel || 'add-object', { ...doc, model, call, type }, result, true);
}

export const getContext = async (execution: IExecution) => {
  const result = [];
  return {
    result,
    tag: {
      getObject: (id) => (apiWrapper('tag-getObject', 'get-object', { model: `Tags`, call: 'getTag', id }, result)),
      findObjects: (selector) => (apiWrapper('tag-findObjects', 'find-objects', { model: `Tags`, selector }, result)),
    },
    contact: {
      getObject: (id) => (apiWrapper('contact-getObject', 'get-object', { model: `Customers`, call: 'getCustomer', id }, result)),
      findObjects: (selector) => (apiWrapper('contact-findObjects', 'find-objects', { model: `Customers`, selector }, result)),
      associations: (relType, mainTypeId?, model?) => (apiWrapper('contact-associations', 'find-conformities', { mainType: 'customer', mainTypeId: mainTypeId || execution.target._id, relType, model }, result)),
      createObject: (doc) => (createObjectWrapper('contact-createObject', execution, doc, 'Customers', 'createCustomer', 'customer', result)),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('contact-setAssociotions', 'set-conformities', { mainType: 'customer', mainTypeId, relType, relTypeIds }, result, true)),
      setProperty: (doc, id?) => (apiWrapper('contact-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Customers' }, result, true)),
      removeItem: (ids) => (apiWrapper('contact-removeItem', 'remove-objects', { model: 'Customers', call: 'removeCustomers', ids }, result, true)),
    },
    company: {
      getObject: (id) => (apiWrapper('company-getObject', 'get-object', { model: `Companies`, call: 'getCompany', id }, result)),
      findObjects: (selector) => (apiWrapper('company-findObjects', 'find-objects', { model: `Companies`, selector }, result)),
      associations: (relType, mainTypeId?) => (apiWrapper('company-associations', 'find-conformities', { mainType: 'company', mainTypeId: mainTypeId || execution.target._id, relType }, result)),
      createObject: (doc) => (createObjectWrapper('company-createObject', execution, doc, 'Companies', 'createCompany', 'company', result)),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('company-setAssociotions', 'set-conformities', { mainType: 'company', mainTypeId, relType, relTypeIds }, result, true)),
      setProperty: (doc, id?) => (apiWrapper('company-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Companies' }, result, true)),
      removeItem: (ids) => (apiWrapper('company-removeItem', 'remove-objects', { model: 'Companies', call: 'removeCompanies', ids }, result, true)),
    },
    deal: {
      getObject: (id) => (apiWrapper('deal-getObject', 'get-object', { model: `Deals`, call: 'getDeal', id }, result)),
      findObjects: (selector) => (apiWrapper('deal-findObjects', 'find-objects', { model: `Deals`, selector }, result)),
      associations: (relType, mainTypeId?) => (apiWrapper('deal-associations', 'find-conformities', { mainType: 'deal', mainTypeId: mainTypeId || execution.target._id, relType }, result)),
      createObject: (doc) => (createObjectWrapper('deal-createObject', execution, doc, 'Deals', '', 'deal', result, 'add-deal')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('deal-setAssociotions', 'set-conformities', { mainType: 'deal', mainTypeId, relType, relTypeIds }, result, true)),
      setProperty: (doc, id?) => (apiWrapper('deal-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Deals' }, result, true)),
      removeItem: (ids) => (apiWrapper('deal-removeItem', 'remove-deal', { model: 'Deals', call: 'removeDeals', ids }, result, true)),
    },
    task: {
      getObject: (id) => (apiWrapper('task-getObject', 'get-object', { model: `Tasks`, call: 'getTask', id }, result)),
      findObjects: (selector) => (apiWrapper('task-findObjects', 'find-objects', { model: `Tasks`, selector }, result)),
      associations: (relType, mainTypeId?) => (apiWrapper('task-associations', 'find-conformities', { mainType: 'task', mainTypeId: mainTypeId || execution.target._id, relType }, result)),
      createObject: (doc) => (createObjectWrapper('task-createObject', execution, doc, 'Tasks', '', 'task', result, 'add-task')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('task-setAssociotions', 'set-conformities', { mainType: 'task', mainTypeId, relType, relTypeIds }, result, true)),
      setProperty: (doc, id?) => (apiWrapper('task-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Tasks' }, result, true)),
      removeItem: (ids) => (apiWrapper('task-removeItem', 'remove-task', { model: 'Tasks', call: 'removeTasks', ids }, result, true)),
    },
    ticket: {
      getObject: (id) => (apiWrapper('ticket-getObject', 'get-object', { model: `Tickets`, call: 'getTicket', id }, result)),
      findObjects: (selector) => (apiWrapper('ticket-findObjects', 'find-objects', { model: `Tickets`, selector }, result)),
      associations: (relType, mainTypeId?) => (apiWrapper('ticket-associations', 'find-conformities', { mainType: 'ticket', mainTypeId: mainTypeId || execution.target._id, relType }, result)),
      createObject: (doc) => (createObjectWrapper('ticket-createObject', execution, doc, 'Tickets', '', 'ticket', result, 'add-ticket')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('ticket-setAssociotions', 'set-conformities', { mainType: 'ticket', mainTypeId, relType, relTypeIds }, result, true)),
      setProperty: (doc, id?) => (apiWrapper('ticket-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Tickets' }, result, true)),
      removeItem: (ids) => (apiWrapper('ticket-removeItem', 'remove-ticket', { model: 'Tickets', call: 'removeTickets', ids }, result, true)),
    },
    conversation: {
      getObject: (id) => (apiWrapper('ticket-getObject', 'get-object', { model: `Conversations`, call: 'getConversation', id }, result)),
      findObjects: (selector) => (apiWrapper('ticket-findObjects', 'find-objects', { model: `Conversations`, selector }, result)),
      setProperty: (doc, id?) => (apiWrapper('ticket-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Conversations' }, result, true)),
    },
    teamMember: {
      getObject: (id) => (apiWrapper('ticket-getObject', 'get-object', { model: `Users`, call: 'getUser', id }, result)),
      findObjects: (selector) => (apiWrapper('ticket-findObjects', 'find-objects', { model: `Users`, selector }, result)),
      setProperty: (doc, id?) => (apiWrapper('ticket-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Users' }, result, true)),
    },
    notification: {

    },
    request: {
      sendRequest: async ({ url, method, headers, form, body, params }) => {
        return sendRequest({ url, method, headers, form, body, params });
      }
    },
    plugins: {
      getObject: (model, id) => (apiWrapper('plugins-getObject', 'get-object', { model, id }, result)),
      findObjects: (model, selector) => (apiWrapper('plugins-findObjects', 'find-objects', { model, selector }, result)),
      setProperty: (model, doc, id?) => (apiWrapper('plugins-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model }, result, true)),
    }
  }
}
