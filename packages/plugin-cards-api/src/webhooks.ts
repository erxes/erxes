import { generateModels } from "./connectionResolver";
import { getBoardItemLink } from "./models/utils";

export default {
  actions: [
    {
      label: 'Deal created',
      action: 'create',
      type: 'deal'
    },
    {
      label: 'Deal updated',
      action: 'update',
      type: 'deal'
    },
    {
      label: 'Deal deleted',
      action: 'delete',
      type: 'deal'
    },
    {
      label: 'Deal moved',
      action: 'createBoardItemMovementLog',
      type: 'deal'
    },
    {
      label: 'Task created',
      action: 'create',
      type: 'task'
    },
    {
      label: 'Task updated',
      action: 'update',
      type: 'task'
    },
    {
      label: 'Task deleted',
      action: 'delete',
      type: 'task'
    },
    {
      label: 'Task moved',
      action: 'createBoardItemMovementLog',
      type: 'task'
    },
    {
      label: 'Ticket created',
      action: 'create',
      type: 'ticket'
    },
    {
      label: 'Ticket updated',
      action: 'update',
      type: 'ticket'
    },
    {
      label: 'Ticket deleted',
      action: 'delete',
      type: 'ticket'
    },
    {
      label: 'Ticket moved',
      action: 'createBoardItemMovementLog',
      type: 'ticket'
    }
  ],
  getInfo: async ({ subdomain, data: { data, contentType, actionText, action } }) => {
    const models = await generateModels(subdomain);

    if (!['create', 'update'].includes(action)) {
      return;
    }

    const { object } = data;

    return {
      url: await getBoardItemLink(models, object.stageId, object._id),
      content: `${contentType} ${actionText}`
    };
  }
};