import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter
} from '@erxes/ui/src';
import React from 'react';
import { IConfigsMap } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  save: (configsMap: IConfigsMap) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
};

class MainConfig extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config || {},
      hasOpen: false
    };
  }

  onSave = e => {
    e.preventDefault();
    const { config } = this.state;
    const { configsMap } = this.props;
    configsMap.savingConfig = config;
    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;
    this.setState({ config });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeInputNumber = (code: string, e) => {
    this.onChangeConfig(code, Number(e.target.value));
  };

  onChangeCheck = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  render() {
    const { config } = this.state;
    return (
      <>
        <CollapseContent
          title={__("period lock config")}
          open={false}
        >
          <FormGroup>
            <ControlLabel required={true}>{__('Period lock type')}</ControlLabel>
            <FormControl
              name="periodLockType"
              componentClass="select"
              defaultValue={config['periodLockType']}
              onChange={this.onChangeInput.bind(this, 'periodLockType')}
            >
              {['daily', 'endOfMonth','manual'].map((typeName) => (
                <option key={typeName} value={typeName}>
                  {__(typeName)}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Is Store Interest')}</ControlLabel>
            <FormControl
              className= 'flex-item'
              type= 'checkbox'
              componentClass= 'checkbox'
              name='isStoreInterest'
              checked= {config['isStoreInterest']}
              onChange={this.onChangeCheck.bind(this, 'isStoreInterest')}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="primary"
              icon="check-circle"
              onClick={this.onSave}
              uppercase={false}
            >
              {__('Save')}
            </Button>
          </ModalFooter>
        </CollapseContent>
        <CollapseContent
          title={__("internet bank config")}
          open={false}
        >
          <FormGroup>
            <ControlLabel>{__('one time transaction limit')}</ControlLabel>
            <FormControl
              defaultValue={config['oneTimeTransactionLimit']}
              type="number"
              onChange={this.onChangeInputNumber.bind(this, 'oneTimeTransactionLimit')}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Loan give account type')}</ControlLabel>
            <FormControl
              name="transactionAccountType"
              componentClass="select"
              defaultValue={config['transactionAccountType']}
              onChange={this.onChangeInput.bind(this, 'transactionAccountType')}
            >
              {['khanbank', 'golomt'].map((typeName) => (
                <option key={`${typeName}bank`} value={typeName}>
                  {__(typeName)}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Loan give account number')}</ControlLabel>
            <FormControl
              defaultValue={config['transactionAccountNumber']}
              type="number"
              onChange={this.onChangeInputNumber.bind(this, 'transactionAccountNumber')}
              required={true}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="primary"
              icon="check-circle"
              onClick={this.onSave}
              uppercase={false}
            >
              {__('Save')}
            </Button>
          </ModalFooter>
        </CollapseContent>
      </>
    );
  }
}
export default MainConfig;
