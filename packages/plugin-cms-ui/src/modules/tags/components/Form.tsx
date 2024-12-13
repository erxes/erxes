import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';


type Props = {
  clientPortalId: string;
  tag?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  refetch?: () => void;
};

const TagForm = (props: Props) => {
  const [tag, setTag] = React.useState<any>(
    props.tag || {
      slug: '',
      name: '',
    }
  );

  React.useEffect(() => {}, [tag]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (props.tag) {
      finalValues._id = props.tag._id;
    }

    Object.keys(tag).forEach((key) => {
      if (tag[key] !== undefined) {
        finalValues[key] = tag[key];
      }
    });

    return {
      ...finalValues,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const renderInput = (
      name: string,
      type: string,
      value: any,
      label: string,
      required?: boolean,
      useNumberFormat?: boolean
    ) => {
      const onChangeInput = (e: any) => {
        setTag({
          ...tag,
          [name]: e.target.value,
        });
      };

      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <FormControl
            {...formProps}
            id={name}
            name={name}
            type={type}
            required={required}
            useNumberFormat={useNumberFormat}
            defaultValue={value}
            value={value}
            onChange={onChangeInput}
          />
        </FormGroup>
      );
    };

    return (
      <>
        {renderInput('name', 'text', tag.name, 'Name', true)}

        <ModalFooter>
          <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
            Close
          </Button>

          {renderButton({
            name: 'tag',
            values: generateDoc(),
            isSubmitted,
            callback: () => {
              if (props.refetch) {
                props.refetch();
              }
              closeModal();
            },
            object: tag,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TagForm;
