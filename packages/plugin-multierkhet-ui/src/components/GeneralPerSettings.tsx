import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { KEY_LABELS } from '../constants';
import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false
    };
  }

  onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = this.props;

    const { config } = this.state;
    const key = config.brandId;

    delete configsMap.erkhetConfig[currentConfigKey];
    configsMap.erkhetConfig[key] = config;
    this.props.save(configsMap);
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;

    config[code] = value;

    this.setState({ config });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeBrand = (brandId: string) => {
    this.setState({ config: { ...this.state.config, brandId } });
  };

  renderItem = (key: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  render() {
    const { config } = this.state;

    return (
      <CollapseContent
        title={__(config.title)}
        open={this.props.currentConfigKey === 'newBrand' ? true : false}
      >
        <ContentBox id={'GeneralSettingsMenu'}>
          <CollapseContent title="General settings">
            {this.renderItem('title')}
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Brand</ControlLabel>
                  <SelectBrands
                    label={__('Choose brands')}
                    onSelect={brand => this.onChangeBrand(brand as string)}
                    initialValue={config.brandId}
                    multi={false}
                    name="selectedBrands"
                    customOption={{
                      label: 'No Brand (noBrand)',
                      value: 'noBrand'
                    }}
                  />
                </FormGroup>
                {this.renderItem('apiToken')}
              </FormColumn>
              <FormColumn>
                {this.renderItem('apiKey')}
                {this.renderItem('apiSecret')}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
          <CollapseContent title="Product to erkhet">
            <FormWrapper>
              <FormColumn>
                {this.renderItem(
                  'costAccount',
                  'Cost Account fullCode on erkhet'
                )}
                {this.renderItem(
                  'saleAccount',
                  'Sale Account fullCode on erkhet'
                )}
              </FormColumn>
              <FormColumn>
                {this.renderItem(
                  'productCategoryCode',
                  'Default Category Code on erkhet inventory'
                )}
                {this.renderItem(
                  'consumeDescription',
                  'Set description when incoming erkhet inventory'
                )}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
          <CollapseContent title="Customer to erkhet">
            <FormWrapper>
              <FormColumn>
                {this.renderItem('checkCompanyUrl')}
                {this.renderItem(
                  'customerDefaultName',
                  'Customer default name on erkhet'
                )}
                {this.renderItem('debtAccounts', 'Split "," account fullcode')}
              </FormColumn>
              <FormColumn>
                {this.renderItem(
                  'customerCategoryCode',
                  'Customer default category code on erkhet'
                )}
                {this.renderItem(
                  'companyCategoryCode',
                  'Company default category code on erkhet'
                )}
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
          {isEnabled('loans') && (
            <CollapseContent title="Loan transaction to erkhet">
              {this.renderItem('userEmail', 'user email')}
              {this.renderItem(
                'defaultCustomer',
                'Customer default code on erkhet'
              )}
            </CollapseContent>
          )}
        </ContentBox>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="cancel-1"
            onClick={this.onDelete}
            uppercase={false}
          >
            Delete
          </Button>

          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={this.onSave}
            uppercase={false}
            disabled={config.brandId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}

export default PerSettings;
