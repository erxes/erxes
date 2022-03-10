import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { BOARD_ITEM_EXTENDED_FIELDS } from './constants';
import { sendSegmentMessage } from './messageBroker';
import { Deals, PipelineLabels, Stages, Tasks, Tickets } from './models';

const getStageOptions = async pipelineId => {
  const stages = await Stages.find({ pipelineId });
  const options: Array<{ label: string; value: any }> = [];

  for (const stage of stages) {
    options.push({
      value: stage._id,
      label: stage.name || ''
    });
  }

  return {
    _id: Math.random(),
    name: 'stageId',
    label: 'Stage',
    type: 'stage',
    selectOptions: options
  };
};

const getPipelineLabelOptions = async pipelineId => {
  const labels = await PipelineLabels.find({ pipelineId });
  const options: Array<{ label: string; value: any }> = [];

  for (const label of labels) {
    options.push({
      value: label._id,
      label: label.name
    });
  }

  return {
    _id: Math.random(),
    name: 'labelIds',
    label: 'Labels',
    type: 'label',
    selectOptions: options
  };
};

export const generateFields = async args => {
  const { type, config = {}, segmentId, usageType } = args;
  const { pipelineId } = config;

  let schema: any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  switch (type) {
    case 'deal':
      schema = Deals.schema;
      break;

    case 'task':
      schema = Tasks.schema;
      break;

    case 'ticket':
      schema = Tickets.schema;
      break;
  }

  if (usageType && usageType === 'import') {
    fields = BOARD_ITEM_EXTENDED_FIELDS;
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  if (segmentId || pipelineId) {
    const segment = segmentId
      ? await sendSegmentMessage('findOne', { _id: segmentId }, true)
      : null;

    const labelOptions = await getPipelineLabelOptions(
      pipelineId || (segment ? segment.pipelineId : null)
    );

    const stageOptions = await getStageOptions(
      pipelineId || (segment ? segment.pipelineId : null)
    );

    fields = [...fields, stageOptions, labelOptions];
  } else {
    const stageOptions = {
      _id: Math.random(),
      name: 'stageId',
      label: 'Stage',
      type: 'stage'
    };

    fields = [...fields, stageOptions];
  }

  return fields;
};
