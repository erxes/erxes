import React from 'react';
import { IMenu } from '../types';
import { __ } from '@erxes/ui/src/utils';
import { FormGroup, ControlLabel, FormControl, Button } from '@erxes/ui/src/components';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  menu?: IMenu;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const Form: React.FC<Props> = (props) => {
  const { menu, closeModal, renderButton } = props;

  const generateDoc = (values: {
    _id?: string;
    label: string;
    url: string;
    order: string;
    target: string;
  }) => {
    const finalValues = values;

    if (menu) {
      finalValues._id = menu._id;
    }

    return {
      _id: finalValues._id,
      label: finalValues.label,
      url: finalValues.url,
      order: parseInt(finalValues.order, 10),
      target: finalValues.target
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const object = menu || { url: '', label: '', order: 0, target: '_self' };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Label')}</ControlLabel>
          <FormControl
            {...formProps}
            name="label"
            defaultValue={object.label}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>{__('URL')}</ControlLabel>
          <FormControl
            {...formProps}
            name="url"
            defaultValue={object.url}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Order')}</ControlLabel>
          <FormControl
            {...formProps}
            name="order"
            type="number"
            defaultValue={object.order}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Target')}</ControlLabel>
          <FormControl
            {...formProps}
            name="target"
            componentClass="select"
            defaultValue={object.target}
          >
            <option value="_self">Same Tab</option>
            <option value="_blank">New Tab</option>
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          {renderButton({
            name: 'menu',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: menu,
          })}
        </ModalFooter>
      </>
    );
  };

  return renderContent({});
};

export default Form;
