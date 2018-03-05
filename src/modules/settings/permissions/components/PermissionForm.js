import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl
} from 'modules/common/components';
import Select from 'react-select-plus';
import { generateModuleParams, generateUsersParams } from './utils';

const propTypes = {
  save: PropTypes.func,
  modules: PropTypes.array.isRequired,
  actions: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  history: PropTypes.object
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class PermissionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedModule: '',
      selectedActions: [],
      selectedUsers: []
    };

    this.save = this.save.bind(this);
    this.changeModule = this.changeModule.bind(this);
  }

  save(e) {
    e.preventDefault();

    const { selectedModule, selectedActions, selectedUsers } = this.state;

    this.props.save(
      {
        module: selectedModule,
        actions: this.collectValues(selectedActions),
        userIds: this.collectValues(selectedUsers),
        allowed: document.getElementById('allowed').checked
      },
      () => {
        this.context.closeModal();
      }
    );
  }

  changeModule(item) {
    this.setState({
      selectedModule: item ? item.value : '',
      selectedActions: []
    });
  }

  collectValues(items) {
    return items.map(item => item.value);
  }

  renderContent() {
    const { modules, actions, users } = this.props;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Choose the module</ControlLabel>
          <br />

          <Select
            placeholder="Choose module"
            options={generateModuleParams(modules)}
            value={this.state.selectedModule}
            onChange={items => {
              this.changeModule(items);
            }}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose the actions</ControlLabel>
          <br />

          <Select
            placeholder="Choose actions"
            options={generateModuleParams(actions)}
            value={this.state.selectedActions}
            onChange={items => {
              this.setState({ selectedActions: items });
            }}
            multi
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose the users</ControlLabel>
          <br />

          <Select
            placeholder="Choose users"
            options={generateUsersParams(users)}
            value={this.state.selectedUsers}
            onChange={items => {
              this.setState({ selectedUsers: items });
            }}
            multi
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
      </div>
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent()}
        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onClick}
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

PermissionForm.propTypes = propTypes;
PermissionForm.contextTypes = contextTypes;

export default PermissionForm;
