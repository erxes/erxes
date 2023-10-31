import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Tip
} from '@erxes/ui/src/components';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { __ } from '@erxes/ui/src/utils';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import Select from 'react-select-plus';
import React from 'react';
import { IConfigsMap } from '../types';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import SelectBrands from '@erxes/ui/src/brands/containers/SelectBrands';
import { GroupWrapper } from '@erxes/ui-segments/src/styles';

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
  brandRules: any;
  fieldsCombined: FieldsCombinedByType[];
};

class PerSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false,
      brandRules: props.config.brandRules || {},
      fieldsCombined: []
    };

    if (isEnabled('forms')) {
      client
        .query({
          query: gql(formQueries.fieldsCombinedByContentType),
          variables: {
            contentType: 'cards:deal'
          }
        })
        .then(({ data }) => {
          this.setState({
            fieldsCombined: data ? data.fieldsCombinedByContentType : [] || []
          });
        });
    }
  }

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ config: { ...this.state.config, stageId } });
  };

  onSave = e => {
    e.preventDefault();
    const { configsMap, currentConfigKey } = this.props;
    const { config, brandRules } = this.state;
    const key = config.stageId;

    delete configsMap.stageInSaleConfig[currentConfigKey];
    configsMap.stageInSaleConfig[key] = { ...config, brandRules };
    this.props.save(configsMap);
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.currentConfigKey);
  };

  onChangeCombo = option => {
    this.onChangeConfig('defaultPay', option.value);
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;
    this.setState({ config });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onresponseCustomFieldChange = option => {
    const value = !option ? '' : option.value.toString();
    this.onChangeConfig('responseField', value);
  };

  renderInput = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          onChange={this.onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          componentClass="checkbox"
          checked={config[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
        />
      </FormGroup>
    );
  };

  addConfig = () => {
    const { brandRules } = this.state;
    this.setState({
      brandRules: {
        ...brandRules,
        newBrand: {
          brandId: '',
          userEmail: '',
          hasPayment: true,
          hasVat: false,
          hasCitytax: false,
          defaultPay: 'debtAmount'
        }
      }
    });
  };

  removeConfig = brandId => {
    const { brandRules } = this.state;
    const newConfig = { ...brandRules };
    delete newConfig[brandId];
    this.setState({
      brandRules: newConfig
    });
  };

  updateConfig = (brandId, key, value) => {
    const { brandRules } = this.state;

    if (key === 'brandId') {
      delete brandRules.newBrand;
    }
    brandRules[brandId] = { ...brandRules[brandId], [key]: value };
    this.setState({
      brandRules: brandRules
    });
  };

  renderPerConfig() {
    const { brandRules } = this.state;

    return Object.keys(brandRules).map(key => {
      return (
        <GroupWrapper key={key}>
          <FormGroup>
            <ControlLabel>Brand</ControlLabel>
            <SelectBrands
              label={__('Choose brands')}
              initialValue={brandRules[key].brandId}
              name="brandId"
              customOption={{
                label: 'No Brand (noBrand)',
                value: 'noBrand'
              }}
              onSelect={brand => this.updateConfig(brand, 'brandId', brand)}
              multi={false}
            />
          </FormGroup>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>User Email</ControlLabel>
                <FormControl
                  value={brandRules[key].userEmail}
                  onChange={e =>
                    this.updateConfig(key, 'userEmail', (e.target as any).value)
                  }
                  required={true}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Has Vat</ControlLabel>
                <FormControl
                  componentClass="checkbox"
                  checked={brandRules[key].hasVat}
                  onChange={e =>
                    this.updateConfig(key, 'hasVat', (e.target as any).checked)
                  }
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>default Pay</ControlLabel>
                <Select
                  value={brandRules[key].defaultPay}
                  onChange={option =>
                    this.updateConfig(key, 'defaultPay', option.value)
                  }
                  clearable={false}
                  required={true}
                  options={[
                    { value: 'debtAmount', label: 'debtAmount' },
                    { value: 'cashAmount', label: 'cashAmount' },
                    { value: 'cardAmount', label: 'cardAmount' }
                  ]}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Has Citytax</ControlLabel>
                <FormControl
                  componentClass="checkbox"
                  checked={brandRules[key].hasCitytax}
                  onChange={e =>
                    this.updateConfig(
                      key,
                      'hasCitytax',
                      (e.target as any).checked
                    )
                  }
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <Tip text={'Delete'}>
            <Button
              btnStyle="simple"
              size="small"
              onClick={this.removeConfig.bind(this, key)}
              icon="times"
            />
          </Tip>
        </GroupWrapper>
      );
    });
  }

  render() {
    const { config } = this.state;
    return (
      <CollapseContent
        title={__(config.title)}
        open={
          this.props.currentConfigKey === 'newStageInSaleConfig' ? true : false
        }
      >
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{'Title'}</ControlLabel>
              <FormControl
                defaultValue={config['title']}
                onChange={this.onChangeInput.bind(this, 'title')}
                required={true}
                autoFocus={true}
              />
            </FormGroup>
            <FormGroup>
              <BoardSelectContainer
                type="deal"
                autoSelectStage={false}
                boardId={config.boardId}
                pipelineId={config.pipelineId}
                stageId={config.stageId}
                onChangeBoard={this.onChangeBoard}
                onChangePipeline={this.onChangePipeline}
                onChangeStage={this.onChangeStage}
              />
            </FormGroup>
            {this.renderCheckbox('hasPayment', 'has Payment')}
            <FormGroup>
              <ControlLabel>{__('Choose response field')}</ControlLabel>
              <Select
                name="responseField"
                value={config.responseField}
                onChange={this.onresponseCustomFieldChange}
                options={(this.state.fieldsCombined || []).map(f => ({
                  value: f.name,
                  label: f.label
                }))}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>{this.renderPerConfig()}</FormColumn>
        </FormWrapper>
        <ModalFooter>
          <Button
            btnStyle="primary"
            onClick={this.addConfig}
            icon="plus"
            uppercase={false}
          >
            Add config
          </Button>
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
            disabled={config.stageId ? false : true}
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerSettings;
