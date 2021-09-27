import {
  Boards,
  Brands,
  Integrations,
  Pipelines,
  Stages,
  Tags,
  Users
} from '../../../db/models';
import { KIND_CHOICES } from '../../../db/models/definitions/constants';

export const getUsers = async () => {
  return Users.aggregate([
    { $match: { username: { $exists: true }, isActive: true } },
    {
      $project: {
        _id: 0,
        label: '$details.fullName',
        value: '$_id'
      }
    }
  ]);
};

export const getBrands = async () => {
  return Brands.aggregate([
    { $match: {} },
    {
      $project: {
        _id: 0,
        label: '$name',
        value: '$_id'
      }
    }
  ]);
};

export const getIntegrations = async () => {
  return Integrations.aggregate([
    { $match: {} },
    {
      $project: {
        _id: 0,
        label: '$name',
        value: '$_id'
      }
    }
  ]);
};

export const getIntegrationTypes = async () => {
  const filters = [] as any;

  for (const kind of KIND_CHOICES.ALL) {
    const integrationIds = await Integrations.find({ kind }).distinct('_id');

    if (integrationIds.length > 0) {
      filters.push({ label: kind, value: integrationIds });
    }
  }

  return filters;
};

export const getTags = async type => {
  return Tags.aggregate([
    { $match: { type } },
    {
      $project: {
        _id: 0,
        label: '$name',
        value: '$_id'
      }
    }
  ]);
};

export const getPipelines = async (stageType: string) => {
  const filters = [] as any;

  const pipelineIds = await Stages.find({ type: stageType }).distinct(
    'pipelineId'
  );

  const pipelines = await Pipelines.aggregate([
    { $match: { _id: { $in: pipelineIds } } },
    {
      $lookup: {
        from: 'stages',
        localField: '_id',
        foreignField: 'pipelineId',
        as: 'stages'
      }
    },
    {
      $project: {
        name: 1,
        'stages._id': 1
      }
    }
  ]);

  pipelines.map(pipeline => {
    const stageIds = [] as any;

    pipeline.stages.map(stage => {
      stageIds.push(stage._id);
    });

    filters.push({ label: pipeline.name, value: stageIds });
  });

  return filters;
};

export const getBoards = async (stageType: string) => {
  const filters = [] as any;

  const pipelineIds = await Stages.find({ type: stageType }).distinct(
    'pipelineId'
  );

  const boardIds = await Pipelines.find({ _id: { $in: pipelineIds } }).distinct(
    'boardId'
  );

  const boards = await Boards.aggregate([
    { $match: { _id: { $in: boardIds } } },
    {
      $lookup: {
        from: 'pipelines',
        localField: '_id',
        foreignField: 'boardId',
        as: 'pipelines'
      }
    },
    {
      $lookup: {
        from: 'stages',
        localField: 'pipelines._id',
        foreignField: 'pipelineId',
        as: 'stages'
      }
    },
    {
      $project: {
        name: 1,
        'stages._id': 1
      }
    }
  ]);

  boards.map(board => {
    const stageIds = [] as any;

    board.stages.map(stage => {
      stageIds.push(stage._id);
    });

    filters.push({ label: board.name, value: stageIds });
  });

  return filters;
};
