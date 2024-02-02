import React, { useState } from 'react';

import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import RichTextEditor from '@erxes/ui/src/containers/RichTextEditor';
import { IFormProps } from '@erxes/ui/src/types';
import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';

import { IEmailTemplate } from '../types';

type Props = {
  object?: IEmailTemplate;
  contentType?: string;
} & ICommonFormProps;

const Form = (props: Props) => {
  const { object, contentType } = props;

  const [content, setContent] = useState<string>(
    (object && object.content) || '',
  );

  const onEditorChange = (e) => {
    setContent(e.editor.getData());
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
      name: finalValues.name,
      content: content,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { _id, name } = object || ({} as IEmailTemplate);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={name}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <RichTextEditor
            content={content}
            onChange={onEditorChange}
            autoGrow={true}
            isSubmitted={formProps.isSaved}
            name={`emailTemplates_${_id || 'create'}`}
            contentType={contentType}
          />
        </FormGroup>
      </>
    );
  };

  return (
    <CommonForm
      {...props}
      name="email template"
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
