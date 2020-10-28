import { connect } from '../db/connection';
import {
  Boards,
  Deals,
  GrowthHacks,
  Pipelines,
  Stages,
  Tasks,
  Tickets
} from '../db/models';

/**
 * Add scopeBranIds field on deal, task, ticket, growthHack
 */

module.exports.up = async () => {
  await connect();

  const { USE_BRAND_RESTRICTIONS } = process.env;

  if (!USE_BRAND_RESTRICTIONS) {
    return;
  }

  const boards = await Boards.find({});

  for (const board of boards) {
    let collection;

    if (board.type === 'deal') {
      collection = Deals;
    }

    if (board.type === 'ticket') {
      collection = Tickets;
    }

    if (board.type === 'task') {
      collection = Tasks;
    }

    if (board.type === 'growthHack') {
      collection = GrowthHacks;
    }

    const pipelines = await Pipelines.find({ boardId: board._id }, { _id: 1 });
    const pipelineIds = pipelines.map(p => p._id);

    const stages = await Stages.find(
      { pipelineId: { $in: pipelineIds } },
      { _id: 1 }
    );
    const stageIds = stages.map(s => s._id);

    await collection.updateMany(
      { stageId: { $in: stageIds }, scopeBrandIds: null },
      { $set: { scopeBrandIds: (board as any).scopeBrandIds } }
    );
  }
};
