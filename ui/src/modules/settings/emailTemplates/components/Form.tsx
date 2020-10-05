import EditorCK from 'modules/common/components/EditorCK';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import React from 'react';
import CommonForm from '../../common/components/Form';
import { ICommonFormProps } from '../../common/types';
import { IEmailTemplate } from '../types';

type Props = {
  object?: IEmailTemplate;
} & ICommonFormProps;

type State = {
  content: string;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      content: (props.object && props.object.content) || ''
    };
  }

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  generateDoc = (values: { _id?: string; name: string; content: string }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      content: this.state.content
    };
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IEmailTemplate);

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
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <EditorCK
            content={this.state.content}
            onChange={this.onEditorChange}
            insertItems={EMAIL_CONTENT}
            autoGrow={true}
            name={`emailTemplates_${object._id || 'create'}`}
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

export default Form;
