import { escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery, PipelineStage } from 'mongoose';
import {
  ITechCardDocument,
  ITechCardListParams,
  ITechCardOutputListParams,
} from '../@types/techCards';

export const getTechCardFilter = (
  params: ITechCardListParams,
): FilterQuery<ITechCardDocument> => {
  const query: FilterQuery<ITechCardDocument> = {};
  const regex = (value: string) => ({
    $regex: escapeRegExp(value.trim()),
    $options: 'i',
  });
  if (params.status) query.status = params.status;
  if (typeof params.hasLabor === 'boolean')
    query['laborCosts.0'] = { $exists: params.hasLabor };
  if (typeof params.hasOverhead === 'boolean')
    query['overheadCosts.0'] = { $exists: params.hasOverhead };
  if (params.durationType) query.durationType = params.durationType;
  if (params.inputProductId) query['inputs.productId'] = params.inputProductId;
  if (params.outputProductId)
    query['outputs.productId'] = params.outputProductId;
  if (params.laborCostName?.trim())
    query['laborCosts.name'] = regex(params.laborCostName);
  if (params.overheadCostName?.trim())
    query['overheadCosts.name'] = regex(params.overheadCostName);
  if (params.searchValue?.trim()) {
    const search = regex(params.searchValue);
    query.$or = [{ name: search }, { code: search }, { description: search }];
  }
  return query;
};

export const getTechCardSort = (
  params: ITechCardListParams,
): Record<string, 1 | -1> => {
  const field = [
    'code',
    'name',
    'duration',
    'durationType',
    'status',
    'createdAt',
    'modifiedAt',
  ].includes(params.sortField ?? '')
    ? params.sortField || 'modifiedAt'
    : 'modifiedAt';
  return { [field]: params.sortDirection === 1 ? 1 : -1, _id: 1 };
};

export const getTechCardOutputsPipeline = (
  params: ITechCardOutputListParams,
): PipelineStage[] => {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const perPage = Math.min(100, Math.max(1, Math.floor(params.perPage ?? 20)));
  const sort = getTechCardSort(params);
  const pipeline: PipelineStage[] = [
    { $match: getTechCardFilter(params) },
    { $set: { techCard: '$$ROOT' } },
    { $unwind: { path: '$outputs', includeArrayIndex: 'outputIndex' } },
  ];
  if (params.outputProductId)
    pipeline.push({ $match: { 'outputs.productId': params.outputProductId } });
  if (typeof params.duplicatedOutput === 'boolean') {
    pipeline.push(
      {
        $lookup: {
          from: 'tech_cards',
          let: { cardId: '$_id', productId: '$outputs.productId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$_id', '$$cardId'] },
                    {
                      $in: [
                        '$$productId',
                        { $ifNull: ['$outputs.productId', []] },
                      ],
                    },
                  ],
                },
              },
            },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: 'matchingOutputCards',
        },
      },
      {
        $match: {
          'matchingOutputCards.0': { $exists: params.duplicatedOutput },
        },
      },
    );
  }
  pipeline.push(
    { $sort: { ...sort, outputIndex: 1 } },
    {
      $facet: {
        rows: [
          { $skip: (page - 1) * perPage },
          { $limit: perPage },
          {
            $project: {
              _id: { $concat: ['$_id', ':', { $toString: '$outputIndex' }] },
              techCard: 1,
              output: '$outputs',
              outputIndex: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  );
  return pipeline;
};
