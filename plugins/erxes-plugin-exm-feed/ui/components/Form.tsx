import React, { useState } from 'react';
import { Form, FormControl, Uploader } from 'erxes-ui';
import { IFormProps, IButtonMutateProps } from 'erxes-ui/lib/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => any;
  item?: any;
  closeModal?: () => void;
};

export default function PostForm(props: Props) {
  const item = props.item || {};

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [images, setImage] = useState(item.images || []);

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <div>
          <FormControl
            {...formProps}
            placeholder='Title'
            type='text'
            name='title'
            defaultValue={item.title}
          />

          <FormControl
            {...formProps}
            placeholder='Description'
            componentClass='textarea'
            name='description'
            defaultValue={item.description}
          />

          <br />

          <div>
            <div>Add attachments: </div>
            <Uploader
              defaultFileList={attachments || []}
              onChange={setAttachment}
            />
          </div>

          <div>
            <div>Add image: </div>
            <Uploader defaultFileList={images || []} onChange={setImage} />
          </div>

          {renderButton({
            values: {
              ...values,
              contentType: 'post',
              images,
              attachments
            },
            isSubmitted,
            callback: closeModal
          })}
        </div>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
