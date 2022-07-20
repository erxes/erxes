import Button from '@erxes/ui/src/components/Button';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import GenerateField from '@erxes/ui-settings/src/properties/components/GenerateField';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import CommonForm from '@erxes/ui/src/components/form/Form';

type Props = {
  contentType: any;
  closeModal: () => void;
  entry?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

function Form(props: Props) {
  const [data, setData] = useState({} as any);

  const { closeModal, contentType, renderButton, entry } = props;
  const { fields = [] } = contentType;

  const generateDoc = () => {
    const values = [] as any;

    fields.map(field => {
      const key = field.text;

      if (data[key]) {
        values.push(data[key]);
      }
    });

    const doc = {
      contentTypeId: contentType._id,
      values
    };

    return doc;
  };

  const onChange = (key: string, fieldCode: string, value: any) => {
    setData({
      ...data,
      [key]: {
        fieldCode,
        value
      }
    });
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            {fields.map(field => {
              field.text = field.label;
              return (
                <>
                  <GenerateField
                    key={field._id}
                    field={field}
                    hasLogic={false}
                    currentLocation={{ lat: 0, lng: 0 }}
                    isEditing={false}
                    onValueChange={({ value }) =>
                      onChange(field.text, field.code, value)
                    }
                  />
                </>
              );
            })}
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
            name: 'webbuilder entry',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: entry
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
}

export default Form;
