import {
  Brands,
  Integrations,
  Pipelines,
  Stages,
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

  return filters;
};
