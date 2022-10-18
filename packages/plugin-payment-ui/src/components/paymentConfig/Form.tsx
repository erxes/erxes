import {
  IButtonMutateProps,
  IFormProps,
  ILocationOption
} from '@erxes/ui/src/types';
import React, { useState, useEffect } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IPaymentConfig } from '../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils/core';
import { ILeadIntegration } from '@erxes/ui-leads/src/types';
import SelectPayments from '../../containers/SelectPayments';

type Props = {
  config?: IPaymentConfig;
  excludeIds?: string[];
  integrations: ILeadIntegration[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const ConfigForm = (props: Props) => {
  const { config, integrations, excludeIds = [] } = props;

  const [paymentIds, setPaymentIdes] = useState<string[]>(
    (config && config.paymentIds) || []
  );

  const [contentTypeId, setContentTypeId] = useState<string>(
    (config && config.contentTypeId) || ''
  );

  useEffect(() => {}, [contentTypeId]);

  const generateDoc = () => {
    const finalValues: any = {};

    if (config) {
      finalValues._id = config._id;
    }

    finalValues.paymentIds = paymentIds;
    finalValues.contentType = 'inbox:integrations';
    finalValues.contentTypeId = contentTypeId;

    return {
      ...finalValues
    };
  };

  const onChangeIntegraiton = e => {
    setContentTypeId(e.target.value);
  };

  const onChangePayments = (values: string[]) => {
    setPaymentIdes(values);
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    const integrationsFiltered = integrations.filter(
      integration => !excludeIds.includes(integration._id)
    );

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Integrations</ControlLabel>
          {!config && <p> {__('Select Integration ')}</p>}
          <FormControl
            {...formProps}
            name="integrationId"
            componentClass="select"
            placeholder={__('Select Lead Integration')}
            defaultValue={config && config.contentTypeId}
            onChange={onChangeIntegraiton}
            required={true}
            disabled={config ? true : false}
          >
            <option />
            {integrationsFiltered.map(integration => (
              <option key={integration._id} value={integration._id}>
                {integration.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        {contentTypeId && (
          <SelectPayments
            defaultValue={paymentIds}
            description="Select payment methods for this integration"
            isRequired={true}
            onChange={onChangePayments}
          />
        )}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            passedName: 'configs',
            values: generateDoc(),
            isSubmitted,
            callback: closeModal,
            object: config
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ConfigForm;
