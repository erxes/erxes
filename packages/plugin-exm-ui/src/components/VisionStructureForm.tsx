import React, { useState } from 'react';

import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IFormProps } from '@erxes/ui/src/types';

type Props = {
  object?: any;
  type?: string;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
} & ICommonFormProps;

const Form: React.FC<Props & ICommonFormProps> = (props) => {
  const { object, type, renderButton } = props;

  const [state, setState] = useState({
    structure: (props.object && props.object.structure) || '',
    vision: (props.object && props.object.vision) || '',
  });

  const onEditorChange = (e) => {
    if (type === 'vision') {
      setState((prevState) => ({ ...prevState, vision: e.editor.getData() }));
    } else {
      setState((prevState) => ({
        ...prevState,
        structure: e.editor.getData(),
      }));
    }
  };

  const generateDoc = (values: {
    _id?: string;
    name: string;
    content: string;
  }) => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      structure: state.structure,
      vision: state.vision,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const object = props.object || ({} as any);

    return (
      <FormGroup>
        <EditorCK
          content={type === 'vision' ? state.vision : state.structure}
          onChange={onEditorChange}
          autoGrow={true}
          isSubmitted={formProps.isSaved}
          name={`vision_structure_${object._id || 'create'}`}
          contentType={type}
        />
      </FormGroup>
    );
  };

  return (
    <CommonForm
      {...props}
      renderButton={renderButton}
      name="exm"
      renderContent={renderContent}
      generateDoc={generateDoc}
      object={object}
      createdAt={
        object && object.modifiedAt !== object.createdAt && object.createdAt
      }
    />
  );
};

export default Form;
