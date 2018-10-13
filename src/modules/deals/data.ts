import { IPipeline, IStage } from '../settings/deals/types';
import { IDeal } from './types';

type StagesWithDeals = IStage & { deals: IDeal[] };

const dealFactory = (pipeline: IPipeline, stage: IStage): IDeal => {
  const _id = Math.random().toString();

  return {
    _id,
    order: 1,
    stageId: stage._id,
    assignedUsers: [],
    companies: [],
    customers: [],
    closeDate: new Date(),
    modifiedAt: new Date(),
    pipeline,
    products: [],
    amount: 10000,
    name: `Deal_${_id}`
  };
};

const stageFactory = (
  pipeline: IPipeline,
  dealCount: number
): StagesWithDeals => {
  const _id = Math.random().toString();

  const stage: IStage = {
    _id,
    name: `Stage_${_id}`,
    pipelineId: pipeline._id
  };

  const deals: IDeal[] = [];

  for (let i = 0; i < dealCount; i++) {
    deals.push(dealFactory(pipeline, stage));
  }

  return {
    ...stage,
    deals
  };
};

const generateFakeData = (
  pipeline: IPipeline,
  stageCount: number,
  dealCount: number
) => {
  const stages: StagesWithDeals[] = [];

  for (let i = 0; i < stageCount; i++) {
    stages.push(stageFactory(pipeline, dealCount));
  }

  return stages;
};

export default generateFakeData;
