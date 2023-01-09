import { IBrand } from '@erxes/ui/src/brands/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import { Info, ModalFooter } from '@erxes/ui/src/styles/main';
import React, { useState, useMemo } from 'react';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import memoize from 'lodash/memoize';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  brand?: IBrand;
  onAdd: () => void;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave?: () => void;
  modal?: boolean;
  extended?: boolean;
};

const AddAccountForm = (props: Props) => {
  const { onAdd } = props;

  const [appID, setAppID] = useState('');

  const connectURL = useMemo(
    () =>
      `https://oauth.zaloapp.com/v4/oa/permission?app_id=${appID}&redirect_uri=http%3A%2F%2Flocalhost%2F`,
    [appID]
  );

  const renderField = ({
    label,
    name,
    description = '',
    formProps,
    required = true,
    defaultValue = '',
    onChange
  }: {
    label: string;
    name: string;
    formProps: IFormProps;
    required?: boolean;
    description?: string;
    defaultValue?: any;
    onChange?: (callback: any) => void;
  }) => {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <p>{description}</p>
        <FormControl
          {...formProps}
          name={name}
          required={required}
          autoFocus={name === 'name'}
          defaultValue={defaultValue}
          onChange={onChange}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        {renderField({ label: 'Name', name: 'name', formProps })}
        {renderField({
          label: 'Zalo App ID',
          name: 'app_id',
          description: 'ID Ứng dụng',
          formProps,
          onChange: event => {
            setAppID(event.target.value);
          }
        })}
        {renderField({
          label: 'Zalo Secret key',
          name: 'secret_key',
          description: 'Khóa bí mật của ứng dụng',
          formProps
        })}
        {renderField({
          label: 'Official Account Callback Url',
          name: 'callback_url',
          defaultValue: 'http://localhost/',
          description: '',
          formProps: { ...formProps, disabled: true }
        })}
        {/* {connectURL} */}
        <Button
          btnStyle="primary"
          icon="processor"
          disabled={!appID}
          onClick={onAdd}
        >
          Connect
        </Button>
        {/* {renderExtraContent(formProps.isSaved)} */}

        {/* {renderFooter({ ...formProps })} */}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};
export default AddAccountForm;
