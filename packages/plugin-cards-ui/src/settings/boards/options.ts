import PipelineForm from './components/PipelineForm';
import StageItem from './components/StageItem';

const options = {
  boardName: 'Board',
  pipelineName: 'pipeline',
  StageItem,
  PipelineForm,
  modal: 'true'
};

const templateOptions = {
  StageItem,
  boardName: 'Category',
  pipelineName: 'Template',
  PipelineForm
};

export { options, templateOptions };
