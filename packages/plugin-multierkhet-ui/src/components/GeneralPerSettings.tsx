import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { KEY_LABELS } from '../constants';
import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from '@erxes/ui/src/styles/main';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = (props: Props) => {
  const [config, setConfig] = useState(props.config);
  const { configsMap, currentConfigKey, save } = props;

  const onSave = (e) => {
    e.preventDefault();

    const key = config.brandId;

    delete configsMap.erkhetConfig[currentConfigKey];
    configsMap.erkhetConfig[key] = config;
    save(configsMap);
  };

  const onDelete = (e) => {
    e.preventDefault();

    props.delete(currentConfigKey);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;

    setConfig(config);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeBrand = (brandId: string) => {
    setConfig({ ...config, brandId });
  };

  const onChangePayments = (ids) => {
    setConfig({ ...config, paymentIds: ids });
  };

  const renderItem = (key: string, description?: string) => {
    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  return (
    <CollapseContent
      title={__(config.title)}
      open={props.currentConfigKey === 'newBrand' ? true : false}
    >
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent title="General settings">
          {renderItem('title')}
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Brand</ControlLabel>
                <SelectBrands
                  label={__('Choose brands')}
                  onSelect={(brand) => onChangeBrand(brand as string)}
                  initialValue={config.brandId}
                  multi={false}
                  name="selectedBrands"
                  customOption={{
                    label: 'No Brand (noBrand)',
                    value: 'noBrand',
                  }}
                />
              </FormGroup>
              {renderItem('apiToken')}
            </FormColumn>
            <FormColumn>
              {renderItem('apiKey')}
              {renderItem('apiSecret')}
            </FormColumn>
          </FormWrapper>
        </CollapseContent>
        <CollapseContent title="Product to erkhet">
          <FormWrapper>
            <FormColumn>
              {renderItem('costAccount', 'Cost Account fullCode on erkhet')}
              {renderItem('saleAccount', 'Sale Account fullCode on erkhet')}
            </FormColumn>
            <FormColumn>
              {renderItem(
                'productCategoryCode',
                'Default Category Code on erkhet inventory',
              )}
              {renderItem(
                'consumeDescription',
                'Set description when incoming erkhet inventory',
              )}
            </FormColumn>
          </FormWrapper>
        </CollapseContent>
        <CollapseContent title="Customer to erkhet">
          <FormWrapper>
            <FormColumn>
              {renderItem('checkCompanyUrl')}
              {renderItem(
                'customerDefaultName',
                'Customer default name on erkhet',
              )}
              {renderItem('debtAccounts', 'Split "," account fullcode')}
            </FormColumn>
            <FormColumn>
              {renderItem(
                'customerCategoryCode',
                'Customer default category code on erkhet',
              )}
              {renderItem(
                'companyCategoryCode',
                'Company default category code on erkhet',
              )}
            </FormColumn>
          </FormWrapper>
        </CollapseContent>
        {isEnabled('loans') && (
          <CollapseContent title="Loan transaction to erkhet">
            {renderItem('userEmail', 'user email')}
            {renderItem('defaultCustomer', 'Customer default code on erkhet')}
          </CollapseContent>
        )}
        {isEnabled('payment') && (
          <CollapseContent title="Allow online payments">
            <FormWrapper>
              <FormColumn>
                {loadDynamicComponent('selectPayments', {
                  defaultValue: config.paymentIds || [],
                  onChange: (ids: string[]) => onChangePayments(ids),
                })}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
        )}
      </ContentBox>
      <ModalFooter>
        <Button
          btnStyle="simple"
          icon="cancel-1"
          onClick={onDelete}
          uppercase={false}
        >
          Delete
        </Button>

        <Button
          btnStyle="primary"
          icon="check-circle"
          onClick={onSave}
          uppercase={false}
          disabled={config.brandId ? false : true}
        >
          Save
        </Button>
      </ModalFooter>
    </CollapseContent>
  );
};

export default PerSettings;
