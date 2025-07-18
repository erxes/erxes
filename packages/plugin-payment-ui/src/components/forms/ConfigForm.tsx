import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, getEnv } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

import { IPaymentDocument } from '../../types';
import { SettingsContent } from './styles';
import { PAYMENTCONFIGS } from '../constants';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  payment?: IPaymentDocument;
  metaData?: any;
};

type State = {
  paymentName: string;
  configMap: any;
};

const ConfigForm: React.FC<Props> = ({
  renderButton,
  closeModal,
  payment,
  metaData,
}) => {
  const { name = '', config = {} } = payment || ({} as IPaymentDocument);
  if (payment) {
    metaData = PAYMENTCONFIGS.find((p) => p.kind === payment.kind);
  }

  const callbackUrl = `${getEnv().REACT_APP_API_URL}/pl-payment/callback/${metaData.kind}`;
  const [state, setState] = useState<State>({
    paymentName: name,
    configMap: config,
  });

  const generateDoc = (values: { paymentName: string; configMap: any }) => {
    const generatedValues: any = {
      kind: metaData.kind,
      status: 'active',
      name: values.paymentName,
    };

    // Only include configMap if it's different from the original
    if (JSON.stringify(values.configMap) !== JSON.stringify(config)) {
      generatedValues.config = values.configMap;
    }

    // If it's an existing payment and there are changes, include the ID
    if (payment && Object.keys(generatedValues).length > 0) {
      generatedValues.id = payment._id;
      return generatedValues;
    }

    // For new payments or if nothing changed, return all values
    return payment
      ? { ...generatedValues, id: payment._id }
      : {
          ...generatedValues,
          kind: metaData.kind,
          status: 'active',
          name: values.paymentName,
          config: values.configMap,
        };
  };

  const onChangeConfig = (
    code: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (code === 'paymentName') {
      return setState((prevState) => ({
        ...prevState,
        paymentName: e.target.value,
      }));
    }

    setState((prevState) => ({
      ...prevState,
      configMap: {
        ...prevState.configMap,
        [code]: e.target.value,
      },
    }));
  };

  const renderItem = (
    key: string,
    title: string,
    type?: string,
    description?: string
  ) => {
    let value;

    if (key === 'paymentName') {
      value = state[key as keyof State];
    } else {
      value = state.configMap[key];
    }
    return (
      <FormGroup key={key}>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{description}</p>}
        <FormControl
          defaultValue={value}
          onChange={(e: any) => onChangeConfig(key, e)}
          value={value}
          type={type || 'text'}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;
    const { paymentName } = state;

    const values = {
      paymentName,
      configMap: state.configMap,
    };

    const { inputs } = metaData;

    if (!inputs) {
      return null;
    }

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name', 'text')}

          {inputs.map((input: any) => {
            const { label, key, type } = input;
            return renderItem(key, label, type);
          })}

          {metaData?.kind === 'golomt' && (
            <FormGroup>
              <ControlLabel>{__('Currency')}</ControlLabel>
              <FormControl
                defaultValue={'MNT'}
                componentclass='select'
                onChange={(e: any) => onChangeConfig('currency', e)}
                value={state.configMap.currency || 'MNT'}
              >
                <option value='MNT'>MNT</option>
                <option value='USD'>USD</option>
                <option value='CNY'>CNY</option>
                <option value='EUR'>EUR</option>
              </FormControl>
            </FormGroup>
          )}

          {metaData?.showCallback && (
            <>
              <FormGroup>
                <ControlLabel>{__('Callback URL')}</ControlLabel>
                {
                  <p>
                    {__(
                      'Register following URL in your payment provider or bank'
                    )}
                  </p>
                }
                <FormControl defaultValue={callbackUrl} disabled={true} />
              </FormGroup>
            </>
          )}

          {metaData?.kind === 'golomt' && (
            <>
              <FormGroup>
                <ControlLabel>{__('Notification URL')}</ControlLabel>
                {<p>{__('Please provide this URL to Golomt Bank')}</p>}
                <FormControl
                  defaultValue={`${getEnv().REACT_APP_API_URL}/pl-payment/notification/golomt`}
                  disabled={true}
                />
              </FormGroup>
            </>
          )}

          {metaData && metaData.link && (
            <a href={metaData.link} target='_blank' rel='noreferrer'>
              {__('more info')}
            </a>
          )}
        </SettingsContent>

        <ModalFooter>
          <Button
            btnStyle='simple'
            type='button'
            onClick={closeModal}
            icon='times-circle'
          >
            Cancel
          </Button>
          {renderButton({
            passedName: 'payment',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ConfigForm;
