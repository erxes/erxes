import PipelineForm from './components/PipelineForm';
import StageItem from './components/StageItem';
import TemplateButton from './components/TemplateButton';

const options = {
  boardName: 'Campaign',
  pipelineName: 'Project',
  StageItem,
  ExtraButton: TemplateButton,
  PipelineForm
};

const templateOptions = {
  StageItem,
  boardName: 'Category',
  pipelineName: 'Template',
  PipelineForm
};

export { options, templateOptions };
