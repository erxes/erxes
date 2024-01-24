import React, { useState } from 'react';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from '@erxes/ui/src/styles/main';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps,
} from '@erxes/ui/src/types';
import { IItem } from '../.././types';
import Uploader from '@erxes/ui/src/components/Uploader';
import { extractAttachment } from '@erxes/ui/src/utils/core';

type Props = {
  item?: IItem;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  history: any;
};

const Form = ({ item, renderButton, closeModal, history }: Props) => {
  const [code, setCode] = useState(item?.code || '');
  const [attachment, setAttachment] = useState(item?.attachment || undefined);

  const generateDoc = (values: { _id?: string; code: string }) => {
    const finalValues = { ...values };
    if (item) {
      finalValues._id = item._id;
    }

    return { ...finalValues, attachment };
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    setAttachment(files ? files[0] : undefined);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const object = item || ({} as IItem);

    const attachments =
      (object.attachment && extractAttachment([object.attachment])) || [];

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>Code</ControlLabel>
              <p>
                Depending on your business type, you may type in a barcode or
                any other UPC (Universal Product Code). If you don't use UPC,
                type in any numeric value to differentiate your products. With
                pattern
              </p>
              <FormControl
                {...formProps}
                name="code"
                value={code}
                required={true}
                onChange={(e: any) => {
                  setCode(e.target.value.replace(/\*/g, ''));
                }}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                componentClass="textarea"
                defaultValue={object.description}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Image</ControlLabel>
              <Uploader
                defaultFileList={attachments}
                onChange={onChangeAttachment}
                multiple={false}
                single={true}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'item',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: item,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
