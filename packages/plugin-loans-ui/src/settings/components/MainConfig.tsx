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
  currentConfigKey: string;
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
    configsMap.loansConfig = config;
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

  onChangeDate = (code: string, value) => {
    this.onChangeConfig(code, value);
  };

  render() {
    const { config } = this.state;
    return (
      <>
        <CollapseContent
          title={__(config.title)}
          open={false}
        >
          <FormGroup>
            <ControlLabel required={true}>{__('Organization type')}</ControlLabel>
            <FormControl
              name="organizationType"
              componentClass="select"
              defaultValue={config['organizationType']}
              onChange={this.onChangeInput.bind(this, 'organizationType')}
            >
              {['bbsb', 'entity'].map((typeName, index) => (
                <option key={index} value={typeName}>
                  {__(typeName)}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Calculation number fixed')}</ControlLabel>
            <FormControl
              defaultValue={config['calculationFixed']}
              type="number"
              min={0}
              max={100}
              onChange={this.onChangeInputNumber.bind(this, 'calculationFixed')}
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
              {['daily', 'endOfMonth','manual'].map((typeName, index) => (
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
          <FormGroup>
            <ControlLabel>{__('Is Create Invoice')}</ControlLabel>
            <FormControl
              className= 'flex-item'
              type= 'checkbox'
              componentClass= 'checkbox'
              name='isCreateInvoice'
              checked= {config['isCreateInvoice']}
              onChange={this.onChangeCheck.bind(this, 'isCreateInvoice')}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Is Change Classification')}</ControlLabel>
            <FormControl
              className= 'flex-item'
              type= 'checkbox'
              componentClass= 'checkbox'
              name='isChangeClassification'
              checked= {config['isChangeClassification']}
              onChange={this.onChangeCheck.bind(this, 'isChangeClassification')}
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
          title={__("classification config")}
          open={false}
        >
          <FormGroup>
            <ControlLabel>{__('Normal /Day/ ')}</ControlLabel>
            <FormControl
              defaultValue={config['classificationNormal']}
              type="number"
              min={0}
              max={100}
              onChange={this.onChangeInputNumber.bind(this, 'classificationNormal')}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Expired /Day/ ')}</ControlLabel>
            <FormControl
              defaultValue={config['classificationExpired']}
              type="number"
              min={0}
              max={100}
              onChange={this.onChangeInputNumber.bind(this, 'classificationExpired')}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Doubt /Day/ ')}</ControlLabel>
            <FormControl
              defaultValue={config['classificationDoubt']}
              type="number"
              min={0}
              max={100}
              onChange={this.onChangeInputNumber.bind(this, 'classificationDoubt')}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Negative /Day/ ')}</ControlLabel>
            <FormControl
              defaultValue={config['classificationNegative']}
              type="number"
              min={0}
              max={100}
              onChange={this.onChangeInputNumber.bind(this, 'classificationNegative')}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Bad /Day/ ')}</ControlLabel>
            <FormControl
              defaultValue={config['classificationBad']}
              type="number"
              min={0}
              max={100}
              onChange={this.onChangeInputNumber.bind(this, 'classificationBad')}
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
