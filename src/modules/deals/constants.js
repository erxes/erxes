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
    order: 0,
    amount: 12000
  },
  {
    _id: 'deal112',
    name: 'Deal 1.1.2',
    stageId: 'stage11',
    order: 1,
    amount: 13000
  },
  {
    _id: 'deal121',
    name: 'Deal 1.2.1',
    stageId: 'stage12',
    order: 0,
    amount: 14000
  },
  {
    _id: 'deal122',
    name: 'Deal 1.2.2',
    stageId: 'stage12',
    order: 1,
    amount: 10000
  },
  {
    _id: 'deal131',
    name: 'Deal 1.3.1',
    stageId: 'stage13',
    order: 2,
    amount: 2000
  },
  {
    _id: 'deal211',
    name: 'Deal 2.1.1',
    stageId: 'stage21',
    order: 0,
    amount: 15000
  },
  {
    _id: 'deal212',
    name: 'Deal 2.1.2',
    stageId: 'stage21',
    order: 1,
    amount: 14000
  },
  {
    _id: 'deal221',
    name: 'Deal 2.2.1',
    stageId: 'stage22',
    order: 0,
    amount: 13000
  },
  {
    _id: 'deal222',
    name: 'Deal 2.2.2',
    stageId: 'stage22',
    order: 1,
    amount: 16000
  }
];

export const Products = [
  {
    _id: 'product1',
    name: 'Web development'
  },
  {
    _id: 'product2',
    name: 'Mobile app'
  }
];

export const UOM = [
  {
    _id: 'uom1',
    name: 'Man hour'
  },
  {
    _id: 'uom2',
    name: 'Quantity'
  }
];

export const Currencies = [
  {
    _id: 'currency1',
    name: 'MNT'
  },
  {
    _id: 'currency2',
    name: 'USD'
  }
];
