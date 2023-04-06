import { ILeadIntegration } from '@erxes/ui-leads/src/types';
import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import Select from 'react-select-plus';

import SelectPayments from '../../containers/SelectPayments';
import { IPaymentConfig } from '../../types';

type Props = {
  config?: IPaymentConfig;
  excludeIds?: string[];
  loading?: boolean;
  integrations: ILeadIntegration[];
  onSearch: (value: string) => void;
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

  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    let timeoutId: any = null;

    if (searchValue) {
      timeoutId = setTimeout(() => {
        props.onSearch(searchValue);
      }, 1500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [searchValue, contentTypeId]);

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

  const onChangeIntegraiton = option => {
    setContentTypeId(option.value);
  };

  const onInputChange = value => {
    setSearchValue(value);
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
          <Select
            placeholder={__('Type to search...')}
            value={contentTypeId}
            defaultValue={contentTypeId}
            onChange={onChangeIntegraiton}
            isLoading={props.loading}
            onInputChange={onInputChange}
            options={integrationsFiltered.map(integration => ({
              value: integration._id,
              label: integration.name
            }))}
            multi={false}
          />
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
