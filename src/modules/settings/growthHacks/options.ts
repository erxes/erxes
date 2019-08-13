import StageItem from './components/StageItem';
import TemplateButton from './components/TemplateButton';

const options = {
  boardName: 'Campaign',
  pipelineName: 'Project',
  StageItem,
  ExtraButton: TemplateButton
};

const templateOptions = {
  StageItem,
  boardName: 'Category',
  pipelineName: 'Template'
};

export { options, templateOptions };
