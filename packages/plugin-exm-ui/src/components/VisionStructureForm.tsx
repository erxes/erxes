import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  object?: any;
  type?: string;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
} & ICommonFormProps;

type State = {
  vision: string;
  structure: string;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      structure: (props.object && props.object.structure) || '',
      vision: (props.object && props.object.vision) || ''
    };
  }

  onEditorChange = e => {
    if (this.props.type === 'vision') {
      this.setState({ vision: e.editor.getData() });
    } else {
      this.setState({ structure: e.editor.getData() });
    }
  };

  generateDoc = (values: { _id?: string; name: string; content: string }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      structure: this.state.structure,
      vision: this.state.vision
    };
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as any);

    return (
      <FormGroup>
        <EditorCK
          content={
            this.props.type === 'vision'
              ? this.state.vision
              : this.state.structure
          }
          onChange={this.onEditorChange}
          autoGrow={true}
          isSubmitted={formProps.isSaved}
          name={`vision_structure_${object._id || 'create'}`}
          contentType={this?.props?.type}
        />
      </FormGroup>
    );
  };

  render() {
    const { object } = this.props;

    return (
      <CommonForm
        {...this.props}
        name="exm"
        renderButton={this.props.renderButton}
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
