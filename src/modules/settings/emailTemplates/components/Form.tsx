import {
  ControlLabel,
  EditorCK,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { EMAIL_CONTENT } from 'modules/engage/constants';
import * as React from 'react';
import { Form as CommonForm } from '../../common/components';
import { ICommonFormProps } from '../../common/types';
import { IEmailTemplate } from '../types';

type Props = {
  object?: IEmailTemplate;
} & ICommonFormProps;

type State = {
  content: string;
};

class Form extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      content: (props.object && props.object.content) || ''
    };
  }

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('template-name') as HTMLInputElement)
          .value,
        content: this.state.content
      }
    };
  };

  renderContent = () => {
    const object = this.props.object || ({} as IEmailTemplate);

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="template-name"
            defaultValue={object.name}
            type="text"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <EditorCK
            content={this.state.content}
            onChange={this.onEditorChange}
            insertItems={EMAIL_CONTENT}
            height={460}
          />
        </FormGroup>
      </React.Fragment>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
      />
    );
  }
}

export default Form;
