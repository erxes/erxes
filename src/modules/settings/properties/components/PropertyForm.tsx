import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger,
  ModifiableList
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import * as React from 'react';

import PropertyGroupForm from '../containers/PropertyGroupForm';
import { Row } from '../styles';
import { IField, IFieldGroup } from '../types';

type Doc = {
  type: string;
  validation: string;
  text: string;
  description: string;
  options: any[];
  groupId: string;
};

type Props = {
  add: (params: { doc: Doc }) => void;
  edit: ({ _id, doc }: { _id: string; doc: Doc }) => void;
  queryParams: any;

  field?: IField;
  groups: IFieldGroup[];
  closeModal: () => void;
};

type State = {
  options: any[];
  type: string;
  hasOptions: boolean;
  add: boolean;
};

class PropertyForm extends React.Component<Props, State> {
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
  }

  onSubmit = e => {
    e.preventDefault();
    const groupId = (document.getElementById('groupId') as HTMLInputElement)
      .value;
    const validation = (document.getElementById(
      'validation'
    ) as HTMLInputElement).value;
    const text = (document.getElementById('text') as HTMLInputElement).value;
    const description = (document.getElementById(
      'description-property'
    ) as HTMLInputElement).value;

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

    if (!groupId) {
      return Alert.error('Choose group!');
    }

    if (!type) {
      return Alert.error('Insert type!');
    }

    if (field) {
      edit({ _id: field._id, doc });
    } else {
      add({ doc });
    }

    this.props.closeModal();
  };

  onChangeOption = options => {
    this.setState({ options });
  };

  onRemoveOption = options => {
    this.setState({ options });
  };

  onTypeChange = e => {
    const value = e.target.value;

    let doc = { hasOptions: false, options: [] };

    if (value === 'select' || value === 'check' || value === 'radio') {
      doc = { hasOptions: true, options: [] };
    }

    this.setState({ type: value, ...doc });
  };

  renderOptions = () => {
    if (!this.state.hasOptions) {
      return null;
    }

    return (
      <ModifiableList
        options={this.state.options}
        onChangeOption={this.onChangeOption}
      />
    );
  };

  renderAddGroup = () => {
    const { queryParams } = this.props;

    const trigger = <Button>Create group</Button>;
    const content = props => (
      <PropertyGroupForm {...props} queryParams={queryParams} />
    );

    return (
      <ModalTrigger title="Add Property" trigger={trigger} content={content} />
    );
  };

  render() {
    const {
      groups,
      field = { text: '', description: '', groupId: '', validation: '' }
    } = this.props;
    const { type } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <FormGroup>
          <ControlLabel required={true}>Name:</ControlLabel>
          <FormControl
            type="text"
            id="text"
            defaultValue={field.text || ''}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            id="description-property"
            componentClass="textarea"
            defaultValue={field.description || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Group:</ControlLabel>
          <Row>
            <FormControl
              id="groupId"
              componentClass="select"
              defaultValue={
                field.groupId || groups.length > 0 ? groups[0]._id : ''
              }
            >
              {groups.map(group => {
                return (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                );
              })}
            </FormControl>
            {this.renderAddGroup()}
          </Row>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Type:</ControlLabel>

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
