import { IExecution } from '../models/Executions';
import { sendRequest } from 'erxes-api-utils';
import { sendRPCMessage } from '../messageBroker';

const apiWrapper = async (kind, channel, data) => {
  try {
    console.log(channel, 'bbbbbbbbbbbbbb');
    const response = await sendRPCMessage(channel, data)
    if (response.error) {
      throw new Error(`subAction: ${kind}, error: ${response.error}`)
    }

    return response
  } catch (e) {
    throw new Error(e.message)
  }
}

const createObjectWrapper = (kind, execution: IExecution, doc: any, model: string, call: string, type: string, channel?: string) => {
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

  return apiWrapper(kind, channel || 'add-object', { ...doc, model, call, type });
}

export const getContext = async (execution: IExecution) => {
  return {
    tag: {
      getObject: (id) => (apiWrapper('tag-getObject', 'get-object', { model: `Tags`, call: 'getTag', id })),
      findObjects: (selector) => (apiWrapper('tag-findObjects', 'find-objects', { model: `Tags`, selector })),
    },
    contact: {
      getObject: (id) => (apiWrapper('contact-getObject', 'get-object', { model: `Customers`, call: 'getCustomer', id })),
      findObjects: (selector) => (apiWrapper('contact-findObjects', 'find-objects', { model: `Customers`, selector })),
      associations: (relType, mainTypeId?, model?) => (apiWrapper('contact-associations', 'find-conformities', { mainType: 'customer', mainTypeId: mainTypeId || execution.target._id, relType, model })),
      createObject: (doc) => (createObjectWrapper('contact-createObject', execution, doc, 'Customers', 'createCustomer', 'customer')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('contact-setAssociotions', 'set-conformities', { mainType: 'customer', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (apiWrapper('contact-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Customers' })),
      removeItem: (ids) => (apiWrapper('contact-removeItem', 'remove-objects', { model: 'Customers', call: 'removeCustomers', ids })),
    },
    company: {
      getObject: (id) => (apiWrapper('company-getObject', 'get-object', { model: `Companies`, call: 'getCompany', id })),
      findObjects: (selector) => (apiWrapper('company-findObjects', 'find-objects', { model: `Companies`, selector })),
      associations: (relType, mainTypeId?) => (apiWrapper('company-associations', 'find-conformities', { mainType: 'company', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper('company-createObject', execution, doc, 'Companies', 'createCompany', 'company')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('company-setAssociotions', 'set-conformities', { mainType: 'company', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (apiWrapper('company-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Companies' })),
      removeItem: (ids) => (apiWrapper('company-removeItem', 'remove-objects', { model: 'Companies', call: 'removeCompanies', ids })),
    },
    deal: {
      getObject: (id) => (apiWrapper('deal-getObject', 'get-object', { model: `Deals`, call: 'getDeal', id })),
      findObjects: (selector) => (apiWrapper('deal-findObjects', 'find-objects', { model: `Deals`, selector })),
      associations: (relType, mainTypeId?) => (apiWrapper('deal-associations', 'find-conformities', { mainType: 'deal', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper('deal-createObject', execution, doc, 'Deals', '', 'deal', 'add-deal')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('deal-setAssociotions', 'set-conformities', { mainType: 'deal', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (apiWrapper('deal-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Deals' })),
      removeItem: (ids) => (apiWrapper('deal-removeItem', 'remove-deal', { model: 'Deals', call: 'removeDeals', ids })),
    },
    task: {
      getObject: (id) => (apiWrapper('task-getObject', 'get-object', { model: `Tasks`, call: 'getTask', id })),
      findObjects: (selector) => (apiWrapper('task-findObjects', 'find-objects', { model: `Tasks`, selector })),
      associations: (relType, mainTypeId?) => (apiWrapper('task-associations', 'find-conformities', { mainType: 'task', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper('task-createObject', execution, doc, 'Tasks', '', 'task', 'add-task')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('task-setAssociotions', 'set-conformities', { mainType: 'task', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (apiWrapper('task-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Tasks' })),
      removeItem: (ids) => (apiWrapper('task-removeItem', 'remove-task', { model: 'Tasks', call: 'removeTasks', ids })),
    },
    ticket: {
      getObject: (id) => (apiWrapper('ticket-getObject', 'get-object', { model: `Tickets`, call: 'getTicket', id })),
      findObjects: (selector) => (apiWrapper('ticket-findObjects', 'find-objects', { model: `Tickets`, selector })),
      associations: (relType, mainTypeId?) => (apiWrapper('ticket-associations', 'find-conformities', { mainType: 'ticket', mainTypeId: mainTypeId || execution.target._id, relType })),
      createObject: (doc) => (createObjectWrapper('ticket-createObject', execution, doc, 'Tickets', '', 'ticket', 'add-ticket')),
      setAssociotions: (mainTypeId, relType, relTypeIds) => (apiWrapper('ticket-setAssociotions', 'set-conformities', { mainType: 'ticket', mainTypeId, relType, relTypeIds })),
      setProperty: (doc, id?) => (apiWrapper('ticket-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Tickets' })),
      removeItem: (ids) => (apiWrapper('ticket-removeItem', 'remove-ticket', { model: 'Tickets', call: 'removeTickets', ids })),
    },
    conversation: {
      getObject: (id) => (apiWrapper('ticket-getObject', 'get-object', { model: `Conversations`, call: 'getConversation', id })),
      findObjects: (selector) => (apiWrapper('ticket-findObjects', 'find-objects', { model: `Conversations`, selector })),
      setProperty: (doc, id?) => (apiWrapper('ticket-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Conversations' })),
    },
    teamMember: {
      getObject: (id) => (apiWrapper('ticket-getObject', 'get-object', { model: `Users`, call: 'getUser', id })),
      findObjects: (selector) => (apiWrapper('ticket-findObjects', 'find-objects', { model: `Users`, selector })),
      setProperty: (doc, id?) => (apiWrapper('ticket-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model: 'Users' })),
    },
    notification: {

    },
    request: {
      sendRequest: async ({ url, method, headers, form, body, params }) => {
        return sendRequest({ url, method, headers, form, body, params });
      }
    },
    plugins: {
      getObject: (model, id) => (apiWrapper('plugins-getObject', 'get-object', { model, id })),
      findObjects: (model, selector) => (apiWrapper('plugins-findObjects', 'find-objects', { model, selector })),
      setProperty: (model, doc, id?) => (apiWrapper('plugins-setProperty', 'set-property', { ...doc, _id: doc._id || id || execution.target._id, model })),
    }
  }
}
