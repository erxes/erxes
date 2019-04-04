import { IUser } from 'modules/auth/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import Select from 'react-select-plus';
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
};

class PermissionForm extends React.Component<Props, State> {
  state = {
    selectedModule: '',
    selectedActions: [],
    selectedUsers: [],
    selectedGroups: []
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
      selectedGroups
    } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel>Choose the module</ControlLabel>
          <br />

          <Select
            placeholder="Choose module"
            options={generateModuleParams(modules)}
            value={selectedModule}
            onChange={this.changeModule}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose the actions</ControlLabel>
          <br />

          <Select
            placeholder="Choose actions"
            options={filterActions(actions, selectedModule)}
            value={selectedActions}
            onChange={this.select.bind(this, 'selectedActions')}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose the groups</ControlLabel>
          <br />

          <Select
            placeholder="Choose groups"
            options={generateListParams(groups)}
            value={selectedGroups}
            onChange={this.select.bind(this, 'selectedGroups')}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose the users</ControlLabel>
          <br />

          <Select
            placeholder="Choose users"
            options={generateListParams(users)}
            value={selectedUsers}
            onChange={this.select.bind(this, 'selectedUsers')}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Allow</ControlLabel>
          <FormControl
            componentClass="checkbox"
            defaultChecked={false}
            id="allowed"
          />
        </FormGroup>
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
            icon="close"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Save
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

export default PermissionForm;
