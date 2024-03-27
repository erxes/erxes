import PipelineForm from './components/PipelineForm';
import StageItem from './components/StageItem';

const options = {
  boardName: 'Campaign',
  pipelineName: 'Project',
  StageItem,
  PipelineForm,
  additionalButton: '/settings/boards/growthHackTemplate',
  additionalButtonText: 'Go to templates'
};

const templateOptions = {
  StageItem,
  boardName: 'Category',
  pipelineName: 'Template',
  PipelineForm
};

export { options, templateOptions };
