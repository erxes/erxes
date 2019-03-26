import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import { Form as CommonForm } from '../../common/components';
import { ICommonFormProps } from '../../common/types';
import { IEmailTemplate } from '../types';

type Props = {
  object?: IEmailTemplate;
};

class Form extends React.Component<Props & ICommonFormProps, {}> {
  generateDoc = () => {
    return {
      doc: {
        name: (document.getElementById('template-name') as HTMLInputElement)
          .value,
        content: (document.getElementById(
          'template-content'
        ) as HTMLTextAreaElement).value
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

          <FormControl
            id="template-content"
            componentClass="textarea"
            rows={5}
            defaultValue={object.content}
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
