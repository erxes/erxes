import { IStage } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import React from 'react';
import CommonForm from '../../common/components/Form';
import { ICommonFormProps } from '../../common/types';
import { Warning } from '../styles';
import { IPipelineTemplate } from '../types';
import Stages from './Stages';

type Props = {
  object?: IPipelineTemplate;
} & ICommonFormProps;

type State = {
  content: string;
  stages: IStage[];
};

class TemplateForm extends React.Component<Props & ICommonFormProps, State> {
  constructor(props: Props) {
    super(props);

    const { object } = props;
    const stages = object && object.stages ? object.stages : [];

    this.state = {
      stages: stages.map((stage: IStage) => ({
        _id: stage._id,
        name: stage.name,
        formId: stage.formId
      })),
      content: (object && object.content) || ''
    };
  }

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { object } = this.props;
    const finalValues = values;
    const { stages } = this.state;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      description: finalValues.description,
      type: 'growthHack',
      stages: stages.filter(el => el.name && el.formId)
    };
  };

  onChangeStages = stages => {
    this.setState({ stages });
  };

  renderWarning() {
    if (!this.props.object) {
      return null;
    }

    return (
      <Warning>
        The previous projects using that template will not change. Only changes
        to the newly chosen projects.
      </Warning>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IPipelineTemplate);

    return (
      <>
        {this.renderWarning()}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
            componentClass="textarea"
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Stages</ControlLabel>
          <Stages
            stages={this.state.stages}
            onChangeStages={this.onChangeStages}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        name="growth hack template"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
        confirmationUpdate={true}
      />
    );
  }
}

export default TemplateForm;
