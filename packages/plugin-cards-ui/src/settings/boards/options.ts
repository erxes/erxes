import PipelineForm from './components/PipelineForm';
import StageItem from './components/StageItem';

const options = {
  boardName: 'Board',
  pipelineName: 'pipeline',
  StageItem,
  PipelineForm,
  modal: 'true'
  //additionalButton: "modal",
  //   additionalButtonText: "Go to templates",
};

const templateOptions = {
  StageItem,
  boardName: 'Category',
  pipelineName: 'Template',
  PipelineForm
};

export { options, templateOptions };
