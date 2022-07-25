import Button from '@erxes/ui/src/components/Button';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import React, { useState, useEffect } from 'react';
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
  const { closeModal, contentType, renderButton, entry = {} } = props;
  const entryValues = entry.values || [];
  const [data, setData] = useState({} as any);

  useEffect(() => {
    entryValues.forEach(val => {
      setData(dat => ({
        ...dat,
        [val.fieldCode]: {
          fieldCode: val.fieldCode,
          value: val.value
        }
      }));
    });
  }, []);

  const { fields = [] } = contentType;

  const generateDoc = () => {
    const values = [] as any;

    fields.map(field => {
      const key = field.code;

      if (data[key]) {
        values.push(data[key]);
      }
    });

    const doc = {
      contentTypeId: contentType._id,
      values
    } as any;

    if (entry._id) {
      doc._id = entry._id;
    }

    return doc;
  };

  const onChange = (fieldCode: string, value: any) => {
    setData(dat => ({
      ...dat,
      [fieldCode]: {
        fieldCode,
        value
      }
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            {fields.map(field => {
              return (
                <>
                  <GenerateField
                    key={field.code}
                    field={field}
                    hasLogic={false}
                    currentLocation={{
                      lat: 0,
                      lng: 0
                    }}
                    isEditing={false}
                    onValueChange={({ value }) => onChange(field.code, value)}
                    defaultValue={data[field.code]?.value || ''}
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
            object: props.entry
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
}

export default Form;
