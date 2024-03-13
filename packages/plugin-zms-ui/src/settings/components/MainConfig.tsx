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
  save: (configsMap: IConfigsMap) => void;
};

type State = {
  title: string;
  client_id: string;
  secretKey: string;
  organizationId: string;
  branchId: string;
};

class MainConfig extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = props.configsMap?.zmsConfig || {};
  }

  onSave = e => {
    e.preventDefault();
    const { configsMap } = this.props;
    configsMap.zmsConfig = this.state;
    this.props.save(configsMap);
  };

  onChangeConfig = (code: keyof State, value) => {
    this.setState({ [code]: value } as any);
  };

  onChangeInput = (code: keyof State, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  render() {
    const config = this.state;
    return (
      <CollapseContent title={__(config.title)} open>
        <FormGroup>
          <ControlLabel>{__('client_id')}</ControlLabel>
          <FormControl
            defaultValue={config['client_id']}
            type="text"
            min={0}
            max={100}
            onChange={this.onChangeInput.bind(this, 'client_id')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('secretKey')}</ControlLabel>
          <FormControl
            defaultValue={config['secretKey']}
            type="text"
            min={0}
            max={100}
            onChange={this.onChangeInput.bind(this, 'secretKey')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('organization Id')}</ControlLabel>
          <FormControl
            defaultValue={config['organizationId']}
            type="text"
            min={0}
            max={100}
            onChange={this.onChangeInput.bind(this, 'organizationId')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('branch Id')}</ControlLabel>
          <FormControl
            defaultValue={config['branchId']}
            type="number"
            min={0}
            max={100}
            onChange={this.onChangeInput.bind(this, 'branchId')}
            required={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={this.onSave.bind(this)}
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
