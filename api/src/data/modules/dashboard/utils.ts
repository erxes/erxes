import {
  Boards,
  Brands,
  Integrations,
  Pipelines,
  Stages,
  Tags,
  Users
} from '../../../db/models';

export const getUsers = async () => {
  return Users.aggregate([
    { $match: { username: { $exists: true } } },
    {
      $project: {
        _id: 0,
        label: '$username',
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

export const getPipelines = async () => {
  const filters = [] as any;

  const pipelineIds = await Stages.find({ type: 'deal' }).distinct(
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

  await getBoards();

  return filters;
};

export const getBoards = async () => {
  const filters = [] as any;

  const pipelineIds = await Stages.find({ type: 'deal' }).distinct(
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
