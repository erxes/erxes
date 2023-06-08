export const NOTIFICATION_TYPES = {
  CHANNEL_MEMBERS_CHANGE: 'channelMembersChange',
  CONVERSATION_ADD_MESSAGE: 'conversationAddMessage',
  CONVERSATION_ASSIGNEE_CHANGE: 'conversationAssigneeChange',
  CONVERSATION_STATE_CHANGE: 'conversationStateChange',
  DEAL_ADD: 'dealAdd',
  DEAL_REMOVE_ASSIGN: 'dealRemoveAssign',
  DEAL_EDIT: 'dealEdit',
  DEAL_CHANGE: 'dealChange',
  DEAL_DUE_DATE: 'dealDueDate',
  DEAL_DELETE: 'dealDelete',
  PURCHASE_ADD: 'purchaseAdd',
  PURCHASE_REMOVE_ASSIGN: 'purchaseRemoveAssign',
  PURCHASE_EDIT: 'purchaseEdit',
  PURCHASE_CHANGE: 'purchaseChange',
  PURCHASE_DUE_DATE: 'purchaseDueDate',
  PURCHASE_DELETE: 'purchaseDelete',
  GROWTHHACK_ADD: 'growthHackAdd',
  GROWTHHACK_REMOVE_ASSIGN: 'growthHackRemoveAssign',
  GROWTHHACK_EDIT: 'growthHackEdit',
  GROWTHHACK_CHANGE: 'growthHackChange',
  GROWTHHACK_DUE_DATE: 'growthHackDueDate',
  GROWTHHACK_DELETE: 'growthHackDelete',
  TICKET_ADD: 'ticketAdd',
  TICKET_REMOVE_ASSIGN: 'ticketRemoveAssign',
  TICKET_EDIT: 'ticketEdit',
  TICKET_CHANGE: 'ticketChange',
  TICKET_DUE_DATE: 'ticketDueDate',
  TICKET_DELETE: 'ticketDelete',
  TASK_ADD: 'taskAdd',
  TASK_REMOVE_ASSIGN: 'taskRemoveAssign',
  TASK_EDIT: 'taskEdit',
  TASK_CHANGE: 'taskChange',
  TASK_DUE_DATE: 'taskDueDate',
  TASK_DELETE: 'taskDelete',
  CUSTOMER_MENTION: 'customerMention',
  COMPANY_MENTION: 'companyMention',
  IMPORT_DONE: 'importDone',
  ALL: [
    'channelMembersChange',
    'conversationAddMessage',
    'conversationAssigneeChange',
    'conversationStateChange',
    'dealAdd',
    'dealRemoveAssign',
    'dealEdit',
    'dealChange',
    'dealDueDate',
    'dealDelete',
    'purchaseAdd',
    'purchaseRemoveAssign',
    'purchaseEdit',
    'purchaseChange',
    'purchaseDueDate',
    'purchaseDelete',
    'growthHackAdd',
    'growthHackRemoveAssign',
    'growthHackEdit',
    'growthHackChange',
    'growthHackDueDate',
    'growthHackDelete',
    'ticketAdd',
    'ticketRemoveAssign',
    'ticketEdit',
    'ticketChange',
    'ticketDueDate',
    'ticketDelete',
    'taskAdd',
    'taskRemoveAssign',
    'taskEdit',
    'taskChange',
    'taskDueDate',
    'taskDelete',
    'customerMention',
    'companyMention',
    'plugin',
    'importDone'
  ]
};

export const NOTIFICATION_MODULES = [
  {
    name: 'conversations',
    description: 'Conversations',
    types: [
      {
        name: 'conversationStateChange',
        text: 'State change'
      },
      {
        name: 'conversationAssigneeChange',
        text: 'Assignee change'
      },
      {
        name: 'conversationAddMessage',
        text: 'Add message'
      }
    ]
  },

  {
    name: 'channels',
    description: 'Channels',
    types: [
      {
        name: 'channelMembersChange',
        text: 'Members change'
      }
    ]
  },

  {
    name: 'deals',
    description: 'Deals',
    types: [
      {
        name: 'dealAdd',
        text: 'Assigned a new deal  card'
      },
      {
        name: 'dealRemoveAssign',
        text: 'Removed from the deal card'
      },
      {
        name: 'dealEdit',
        text: 'Deal card edited'
      },
      {
        name: 'dealChange',
        text: 'Moved between stages'
      },
      {
        name: 'dealDueDate',
        text: 'Due date is near'
      },
      {
        name: 'dealDelete',
        text: 'Deal card deleted'
      }
    ]
  },

  {
    name: 'purchases',
    description: 'Purchases',
    types: [
      {
        name: 'purchaseAdd',
        text: 'Assigned a new purchase  card'
      },
      {
        name: 'purchaseRemoveAssign',
        text: 'Removed from the purchase card'
      },
      {
        name: 'purchaseEdit',
        text: 'Purchase card edited'
      },
      {
        name: 'purchaseChange',
        text: 'Moved between stages'
      },
      {
        name: 'purchaseDueDate',
        text: 'Due date is near'
      },
      {
        name: 'purchaseDelete',
        text: 'Purchase card deleted'
      }
    ]
  },

  {
    name: 'tickets',
    description: 'Tickets',
    types: [
      {
        name: 'ticketAdd',
        text: 'Assigned a new ticket  card'
      },
      {
        name: 'ticketRemoveAssign',
        text: 'Removed from the ticket card'
      },
      {
        name: 'ticketEdit',
        text: 'Ticket card edited'
      },
      {
        name: 'ticketChange',
        text: 'Moved between stages'
      },
      {
        name: 'ticketDueDate',
        text: 'Due date is near'
      },
      {
        name: 'ticketDelete',
        text: 'Ticket card deleted'
      }
    ]
  },

  {
    name: 'tasks',
    description: 'Tasks',
    types: [
      {
        name: 'taskAdd',
        text: 'Assigned a new task  card'
      },
      {
        name: 'taskRemoveAssign',
        text: 'Removed from the task card'
      },
      {
        name: 'taskEdit',
        text: 'Task card edited'
      },
      {
        name: 'taskChange',
        text: 'Moved between stages'
      },
      {
        name: 'taskDueDate',
        text: 'Due date is near'
      },
      {
        name: 'taskDelete',
        text: 'Task card deleted'
      }
    ]
  },
  {
    name: 'customers',
    description: 'Customers',
    types: [
      {
        name: 'customerMention',
        text: 'Mention on customer note'
      }
    ]
  },
  {
    name: 'companies',
    description: 'Companies',
    types: [
      {
        name: 'companyMention',
        text: 'Mention on company note'
      }
    ]
  }
];
