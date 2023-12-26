import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import React from 'react';
import { IConfigsMap } from '../types';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';

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

    delete configsMap.DYNAMIC[currentConfigKey];
    configsMap.DYNAMIC[key] = config;
    this.props.save(configsMap);

    this.setState({
      config: {
        title: 'New MSDynamic Config',
        brandId: '',
        itemApi: '',
        itemCategoryApi: '',
        priceApi: '',
        customerApi: '',
        salesApi: '',
        salesLineApi: '',
        username: '',
        password: ''
      }
    });
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

  onChangeBrand = (brandId, e: any) => {
    this.onChangeConfig(brandId, e.target.value);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderInput = (key: string, title?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
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
        beforeTitle={<Icon icon="settings" />}
        transparent={true}
        open={this.props.currentConfigKey === 'newDYNAMIC' ? true : false}
      >
        <FormGroup>
          <ControlLabel>{'Title'}</ControlLabel>
          <FormControl
            defaultValue={config.title}
            onChange={this.onChangeInput.bind(this, 'title')}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <SelectBrand
            isRequired={true}
            defaultValue={config.brandId}
            onChange={this.onChangeBrand.bind(this, 'brandId')}
          />
        </FormGroup>

        {this.renderInput('itemApi', 'itemApi')}
        {this.renderInput('itemCategoryApi', 'itemCategoryApi')}
        {this.renderInput('priceApi', 'priceApi')}
        {this.renderInput('customerApi', 'customerApi')}
        {this.renderInput('salesApi', 'salesApi')}
        {this.renderInput('salesLineApi', 'salesLineApi')}
        {this.renderInput('username', 'username')}
        {this.renderInput('password', 'password')}

        <ModalFooter>
          <Button
            btnStyle="danger"
            icon="cancel-1"
            onClick={this.onDelete}
            uppercase={false}
          >
            Delete
          </Button>

          <Button
            btnStyle="success"
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
