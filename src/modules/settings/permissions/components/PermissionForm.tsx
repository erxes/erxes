import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import Select from 'react-select-plus';
import { Divider, StepBody, StepHeader, StepItem } from '../styles';
import { IActions, IModule, IPermissionParams, IUserGroup } from '../types';
import {
  correctValue,
  filterActions,
  generatedList,
  generateListParams,
  generateModuleParams
} from './utils';

type Props = {
  save: (doc: IPermissionParams, callback: () => void) => void;
  modules: IModule[];
  actions: IActions[];
  users: IUser[];
  groups: IUserGroup[];
  closeModal: () => void;
};

type State = {
  selectedModule: string;
  selectedActions: IActions[];
  selectedUsers: IUser[];
  selectedGroups: IUserGroup[];
  valueChanged: boolean;
};

class PermissionForm extends React.Component<Props, State> {
  state = {
    selectedModule: '',
    selectedActions: [],
    selectedUsers: [],
    selectedGroups: [],
    valueChanged: false
  };

  save = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      selectedModule,
      selectedActions,
      selectedUsers,
      selectedGroups
    } = this.state;

    this.props.save(
      {
        module: selectedModule,
        actions: this.collectValues(selectedActions),
        userIds: this.collectValues(selectedUsers),
        groupIds: this.collectValues(selectedGroups),
        allowed: (document.getElementById('allowed') as HTMLInputElement)
          .checked
      },
      () => this.props.closeModal()
    );
  };

  onChange = () => {
    this.setState({ valueChanged: true });
  };

  hasItems = (items: string[]) => {
    return items.length > 0 ? true : false;
  };

  isModuleSelected = () => {
    if (this.state.selectedModule) {
      return true;
    }

    return false;
  };

  select = <T extends keyof State>(name: T, value) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  changeModule = (item: generatedList) => {
    const selectedModule = correctValue(item);

    this.setState({
      selectedModule,
      selectedActions: []
    });
  };

  collectValues = (items: generatedList[]) => {
    return items.map(item => item.value);
  };

  renderContent() {
    const { modules, actions, users, groups } = this.props;
    const {
      selectedModule,
      selectedActions,
      selectedUsers,
      selectedGroups,
      valueChanged
    } = this.state;

    return (
      <>
        <StepItem>
          <StepHeader
            number="1"
            isDone={this.isModuleSelected() && this.hasItems(selectedActions)}
          >
            {__('What action can do')}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>Choose the module</ControlLabel>
              <Select
                placeholder="Choose module"
                options={generateModuleParams(modules)}
                value={selectedModule}
                onChange={this.changeModule}
              />
            </FormGroup>
            <Divider>{__('Then')}</Divider>
            <FormGroup>
              <ControlLabel>Choose the actions</ControlLabel>
              <Select
                placeholder="Choose actions"
                options={filterActions(actions, selectedModule)}
                value={selectedActions}
                disabled={!this.isModuleSelected()}
                onChange={this.select.bind(this, 'selectedActions')}
                multi={true}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <StepItem>
          <StepHeader
            number="2"
            isDone={
              this.hasItems(selectedGroups) || this.hasItems(selectedUsers)
            }
          >
            {__('Who can')}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>Choose the groups</ControlLabel>
              <Select
                placeholder="Choose groups"
                options={generateListParams(groups)}
                value={selectedGroups}
                onChange={this.select.bind(this, 'selectedGroups')}
                multi={true}
              />
            </FormGroup>
            <Divider>{__('Or')}</Divider>
            <FormGroup>
              <ControlLabel>Choose the users</ControlLabel>
              <Select
                placeholder="Choose users"
                options={generateListParams(users)}
                value={selectedUsers}
                onChange={this.select.bind(this, 'selectedUsers')}
                multi={true}
              />
            </FormGroup>
          </StepBody>
        </StepItem>

        <StepItem>
          <StepHeader number="3" isDone={valueChanged}>
            {__('Grant permission')}
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>Allow</ControlLabel>

              <FormControl
                componentClass="checkbox"
                defaultChecked={false}
                id="allowed"
                onChange={this.onChange}
              />
              <p>{__('Check if permission is allowed')}</p>
            </FormGroup>
          </StepBody>
        </StepItem>
      </>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

export default PermissionForm;
