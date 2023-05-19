import {
  __,
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter
} from '@erxes/ui/src';
import React from 'react';
import { IConfigsMap } from '../types';

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
    const key = Math.floor(Math.random() * 1000000000000000);

    delete configsMap.holidayConfig[currentConfigKey];
    configsMap.holidayConfig[key] = config;
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
          <ControlLabel>{'Title'}</ControlLabel>
          <FormControl
            defaultValue={config['title']}
            onChange={this.onChangeInput.bind(this, 'title')}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{'Month'}</ControlLabel>
          <FormControl
            defaultValue={config['month']}
            type={'number'}
            min={1}
            max={12}
            onChange={this.onChangeInput.bind(this, 'month')}
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{'Day'}</ControlLabel>
          <FormControl
            defaultValue={config['day']}
            type={'number'}
            min={1}
            max={31}
            onChange={this.onChangeInput.bind(this, 'day')}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

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
          >
            Save
          </Button>
        </ModalFooter>
      </CollapseContent>
    );
  }
}
export default PerSettings;
