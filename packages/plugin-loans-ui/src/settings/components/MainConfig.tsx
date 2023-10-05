import {
  Button,
  DateControl,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
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
      config: props.config,
      hasOpen: false
    };
  }

  onSave = e => {
    e.preventDefault();
    const { configsMap } = this.props;
    const { config } = this.state;

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

  onChangeDate = (code: string, value) => {
    this.onChangeConfig(code, value);
  };

  render() {
    const { config } = this.state;
    return (
      <CollapseContent
        title={__(config.title)}
        open={this.props.currentConfigKey === 'newEbarimtConfig' ? true : false}
      >
        <FormGroup>
          <ControlLabel>{__('Calculation number fixed')}</ControlLabel>
          <FormControl
            defaultValue={config['calculationFixed']}
            type="number"
            min={0}
            max={100}
            onChange={this.onChangeInput.bind(this, 'calculationFixed')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Display number fixed')}</ControlLabel>
          <FormControl
            defaultValue={config['displayFixed']}
            type="number"
            min={0}
            max={100}
            onChange={this.onChangeInput.bind(this, 'displayFixed')}
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
    );
  }
}
export default MainConfig;
