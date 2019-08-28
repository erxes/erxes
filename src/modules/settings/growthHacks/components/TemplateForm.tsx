import { IStage } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import Stages from 'modules/settings/boards/components/Stages';
import React from 'react';
import CommonForm from '../../common/components/Form';
import { ICommonFormProps } from '../../common/types';
import { options } from '../options';
import { IPipelineTemplate } from '../types';

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

    this.state = {
      stages: object ? this.generateStages(object.stages, true) : [],
      content: (object && object.content) || ''
    };
  }

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  generateStages(stages, hasId: boolean) {
    return stages.map(stage => ({
      _id: hasId ? Math.random().toString() : undefined,
      name: stage.name,
      formId: stage.formId
    }));
  }

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
      stages: this.generateStages(stages, false).filter(el => el.name)
    };
  };

  onChangeStages = stages => {
    this.setState({ stages });
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IPipelineTemplate);

    return (
      <>
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
            options={options}
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
        name="email template"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
      />
    );
  }
}

export default TemplateForm;
