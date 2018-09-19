import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React, { Component, Fragment } from 'react';
import { Actions, TypeList } from '../styles';
import { IField, IFieldGroup } from '../types';

type Props = {
  add: ({ doc }: { doc: any; }) => void;
  edit: ({ _id, doc }: { _id: string, doc: any; }) => void;
  field?: IField;
  groups: IFieldGroup[];
  closeModal: () => void;
};

type State = {
  options: any[]; 
  type: string;
  hasOptions: boolean;
  add: boolean;
}

class PropertyForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let doc = {
      options: [],
      type: '',
      hasOptions: false
    };

    if (props.field) {
      doc = {
        ...doc,
        type: props.field.type
      };

      if (
        props.field.type === 'select' ||
        props.field.type === 'radio' ||
        props.field.type === 'check'
      ) {
        doc = {
          type: props.field.type,
          hasOptions: true,
          options: Object.assign([], props.field.options || [])
        };
      }
    }

    this.state = {
      ...doc,
      add: false
    };

    this.handleAddOption = this.handleAddOption.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.renderOptions = this.renderOptions.bind(this);
    this.handleSaveOption = this.handleSaveOption.bind(this);
    this.renderButtonOrElement = this.renderButtonOrElement.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.handleCancelAddingOption = this.handleCancelAddingOption.bind(this);
    this.handleRemoveOption = this.handleRemoveOption.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const groupId = (document.getElementById('groupId') as HTMLInputElement).value;
    const validation = (document.getElementById('validation') as HTMLInputElement).value;
    const text = (document.getElementById('text') as HTMLInputElement).value;
    const description = (document.getElementById('description') as HTMLInputElement).value;

    const { field, add, edit } = this.props;
    const { type, options } = this.state;

    const doc = {
      type,
      validation,
      text,
      description,
      options,
      groupId
    };

    if (field) {
      edit({ _id: field._id, doc  })
    } else {
      add({ doc });
    }
    
    this.props.closeModal();
  }

  onTypeChange(e) {
    const value = e.target.value;
    
    let doc = { hasOptions: false, options: [] };

    if (value === 'select' || value === 'check' || value === 'radio') {
      doc = { hasOptions: true, options: [] };
    }

    this.setState({ type: value, ...doc });
  }

  handleAddOption() {
    this.setState({ add: true });
  }

  handleCancelAddingOption() {
    this.setState({ add: false });
  }

  handleSaveOption() {
    const { options } = this.state;
    const optionValue = (document.getElementById('optionValue') as HTMLInputElement).value;

    this.setState({ options: [...options, optionValue] });
    this.handleCancelAddingOption();
  }

  handleRemoveOption(index) {
    const { options } = this.state;

    this.setState({
      options: options.splice(index, 1) && options
    });
  }

  renderButtonOrElement() {
    if (this.state.add) {
      return (
        <Fragment>
          <FormControl
            id="optionValue"
            autoFocus
            onKeyPress={e => {
              if (e.key === 'Enter') this.handleSaveOption();
            }}
          />
          <Actions>
            <Button
              type="success"
              icon="cancel-1"
              btnStyle="simple"
              size="small"
              onClick={this.handleSaveOption}
            >
              Cancel
            </Button>
            <Button
              type="success"
              btnStyle="success"
              size="small"
              icon="checked-1"
              onClick={this.handleSaveOption}
            >
              Save
            </Button>
          </Actions>
        </Fragment>
      );
    }

    return (
      <Button onClick={this.handleAddOption} size="small" icon="add">
        {__('Add an option')}
      </Button>
    );
  }

  renderOption(option, index) {
    return (
      <li key={index}>
        {option}
        <Icon icon="cancel-1" onClick={() => this.handleRemoveOption(index)} />
      </li>
    );
  }

  renderOptions() {
    if (!this.state.hasOptions) return null;

    return (
      <TypeList>
        {this.state.options.map((option, index) =>
          this.renderOption(option, index)
        )}
        {this.renderButtonOrElement()}
      </TypeList>
    );
  }

  render() {
    const { groups, field = { text: '', description: '', groupId: '', validation: '' } } = this.props;
    const { type } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <FormGroup>
          <ControlLabel>Name:</ControlLabel>
          <FormControl type="text" id="text" defaultValue={field.text || ''} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            id="description"
            componentClass="textarea"
            defaultValue={field.description || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Group:</ControlLabel>
          <FormControl
            id="groupId"
            componentClass="select"
            defaultValue={field.groupId || groups[0]._id}
          >
            {groups.map(group => {
              return (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              );
            })}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Type:</ControlLabel>

          <FormControl
            componentClass="select"
            value={type}
            onChange={this.onTypeChange}
          >
            <option />
            <option value="input">Input</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
          </FormControl>
        </FormGroup>
        {this.renderOptions()}

        <FormGroup>
          <ControlLabel>Validation:</ControlLabel>

          <FormControl
            componentClass="select"
            id="validation"
            defaultValue={field.validation || ''}
          >
            <option />
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default PropertyForm;
