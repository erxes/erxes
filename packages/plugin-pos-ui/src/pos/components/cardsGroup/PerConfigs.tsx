import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { Alert, __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';

type Props = {
  config: any;
  configKey: string;
  fieldsCombined: any[];
  save: (key: string, value: any) => void;
  delete: (configKey: string) => void;
};

type State = {
  config: any;
  hasOpen: boolean;
};

class PerConfigs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      config: props.config,
      hasOpen: false
    };
  }

  onChangeBranch = branchId => {
    this.setState({ config: { ...this.state.config, branchId } });
  };

  onChangeAsssignedUserIds = assignedUserIds => {
    this.setState({ config: { ...this.state.config, assignedUserIds } });
  };

  onChangeBoard = (boardId: string) => {
    this.setState({ config: { ...this.state.config, boardId } });
  };

  onChangePipeline = (pipelineId: string) => {
    this.setState({ config: { ...this.state.config, pipelineId } });
  };

  onChangeStage = (stageId: string) => {
    this.setState({ config: { ...this.state.config, stageId } });
  };

  onMapCustomFieldChange = option => {
    const value = !option ? '' : option.value.toString();
    this.setState({
      config: { ...this.state.config, deliveryMapField: value }
    });
  };

  onSave = e => {
    e.preventDefault();
    const { configKey } = this.props;
    const { config } = this.state;

    if (!config.branchId) {
      return Alert.error('Please select the branch!');
    }

    this.props.save(configKey, config);
  };

  onDelete = e => {
    e.preventDefault();

    this.props.delete(this.props.configKey);
  };

  onChangeInput = e => {
    const { config } = this.state;
    this.setState({ config: { ...config, [e.target.name]: e.target.value } });
  };

  render() {
    const { fieldsCombined } = this.props;
    const { config } = this.state;
    return (
      <CollapseContent title={__(config.title || 'new Config')}>
        <FormGroup>
          <ControlLabel>{'Title'}</ControlLabel>
          <FormControl
            defaultValue={config['title']}
            name="title"
            onChange={this.onChangeInput}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose Branch</ControlLabel>
          <SelectBranches
            label={__('Choose branch')}
            name="branchIds"
            multi={false}
            initialValue={config.branchId}
            onSelect={this.onChangeBranch}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose Stage</ControlLabel>
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

        <FormGroup>
          <ControlLabel>Choose assigned users</ControlLabel>
          <SelectTeamMembers
            label={__('Choose team member')}
            name="assignedUserIds"
            initialValue={config.assignedUserIds}
            onSelect={this.onChangeAsssignedUserIds}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Choose map field')}</ControlLabel>
          <Select
            name="deliveryMapField"
            value={config.mapCustomField}
            onChange={this.onMapCustomFieldChange}
            options={(fieldsCombined || []).map(f => ({
              value: f.name,
              label: f.label
            }))}
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
export default PerConfigs;
