export const Pipelines = [
  {
    _id: 'pipeline1',
    name: 'Pipeline 1'
  },
  {
    _id: 'pipeline2',
    name: 'Pipeline 2'
  }
];

export const Stages = [
  {
    _id: 'stage11',
    name: 'Stage 1.1',
    pipelineId: 'pipeline1'
  },
  {
    _id: 'stage12',
    name: 'Stage 1.2',
    pipelineId: 'pipeline1'
  },
  {
    _id: 'stage21',
    name: 'Stage 2.1',
    pipelineId: 'pipeline2'
  },
  {
    _id: 'stage22',
    name: 'Stage 2.2',
    pipelineId: 'pipeline2'
  }
];

export const Deals = [
  {
    _id: 'deal111',
    name: 'Deal 1.1.1',
    stageId: 'stage11',
    order: 0
  },
  {
    _id: 'deal112',
    name: 'Deal 1.1.2',
    stageId: 'stage11',
    order: 1
  },
  {
    _id: 'deal121',
    name: 'Deal 1.2.1',
    stageId: 'stage12',
    order: 0
  },
  {
    _id: 'deal122',
    name: 'Deal 1.2.2',
    stageId: 'stage12',
    order: 1
  },
  {
    _id: 'deal211',
    name: 'Deal 2.1.1',
    stageId: 'stage21',
    order: 0
  },
  {
    _id: 'deal212',
    name: 'Deal 2.1.2',
    stageId: 'stage21',
    order: 1
  },
  {
    _id: 'deal221',
    name: 'Deal 2.2.1',
    stageId: 'stage22',
    order: 0
  },
  {
    _id: 'deal222',
    name: 'Deal 2.2.2',
    stageId: 'stage22',
    order: 1
  }
];
