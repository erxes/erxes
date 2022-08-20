import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { __ } from '@erxes/ui/src/utils';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import Select from 'react-select-plus';
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
    const { config } = this.state;
    const key = config.stageId;

    delete configsMap.ebarimtConfig[currentConfigKey];
    configsMap.ebarimtConfig[key] = config;
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
          checked={config[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
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
          <ControlLabel>Destination Stage</ControlLabel>
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

        {this.renderInput('userEmail', 'userEmail', '')}
        {this.renderCheckbox('hasVat', 'hasVat', '')}
        {this.renderCheckbox('hasCitytax', 'hasCitytax', '')}
        {this.renderCheckbox('isEbarimt', 'isEbarimt', '')}

        <FormGroup>
          <ControlLabel>{'defaultPay'}</ControlLabel>
          <Select
            value={config.defaultPay}
            onChange={this.onChangeCombo}
            clearable={false}
            required={true}
            options={[
              { value: 'debtAmount', label: 'debtAmount' },
              { value: 'cashAmount', label: 'cashAmount' },
              { value: 'cardAmount', label: 'cardAmount' }
            ]}
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
