import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { IFormProps } from 'modules/common/types';
import * as React from 'react';
import { Form as CommonForm } from '../../common/components';
import { ICommonFormProps } from '../../common/types';
import { IEmailTemplate } from '../types';

type Props = {
  object?: IEmailTemplate;
};

class Form extends React.Component<Props & ICommonFormProps, {}> {
  generateDoc = (values: { _id?: string; name: string; content: string }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      content: finalValues.content
    };
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IEmailTemplate);

    return (
      <React.Fragment>
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
          <ControlLabel>Content</ControlLabel>
          <FormControl
            {...formProps}
            name="content"
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
        name="email template"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={this.props.object}
      />
    );
  }
}

export default Form;
