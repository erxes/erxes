import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IEmailTemplate } from '../types';
import React from 'react';
import RichTextEditor from '@erxes/ui/src/containers/RichTextEditor';
import { gql, useQuery } from '@apollo/client';

type Props = {
  object?: IEmailTemplate;
  contentType?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  additionalToolbarContent?: (props: {
    onClick: (placeholder: string) => void;
  }) => React.ReactNode;
  contentTypeConfig?: any;
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

  onEditorChange = (content: string) => {
    this.setState({ content });
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
    const { contentType, contentTypeConfig, additionalToolbarContent } =
      this.props || {};
    const object = this.props.object || ({} as IEmailTemplate);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name='name'
            defaultValue={object.name}
            type='text'
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <RichTextEditor
            content={this.state.content}
            onChange={this.onEditorChange}
            autoGrow={true}
            autoGrowMinHeight={300}
            isSubmitted={formProps.isSaved}
            name={`emailTemplates_${object._id || 'create'}`}
            contentType={contentType}
            contentTypeConfig={contentTypeConfig}
            additionalToolbarContent={additionalToolbarContent}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const { object } = this.props;

    return (
      <CommonForm
        {...this.props}
        name='email template'
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={object}
        createdAt={
          object && object.modifiedAt !== object.createdAt && object.createdAt
        }
      />
    );
  }
}

export default Form;
