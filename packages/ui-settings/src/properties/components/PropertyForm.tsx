import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ModifiableList from '@erxes/ui/src/components/ModifiableList';
import Toggle from '@erxes/ui/src/components/Toggle';
import { __ } from '@erxes/ui/src/utils/core';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import {
  IButtonMutateProps,
  IFormProps,
  ILocationOption,
  IObjectListConfig
} from '@erxes/ui/src/types';
import { Row } from '../../integrations/styles';
import React from 'react';
import PropertyGroupForm from '../containers/PropertyGroupForm';
import { IField } from '@erxes/ui/src/types';
import { IFieldGroup } from '../types';
import Map from '@erxes/ui/src/containers/map/Map';
import ObjectListConfigs from './ObjectListConfigs';
import LocationOptions from './LocationOptions';

type Props = {
  queryParams: any;
  field?: IField;
  groups: IFieldGroup[];
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  options: any[];
  locationOptions: any[];
  objectListConfigs: IObjectListConfig[];
  type: string;
  hasOptions: boolean;
  add: boolean;
  currentLocation: ILocationOption;
  searchable: boolean;
  showInCard: boolean;
  isRequired: boolean;
};

class PropertyForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let doc: any = {
      options: [],
      type: '',
      locationOptions: [],
      objectListConfigs: [],
      hasOptions: false,
      searchable: false,
      showInCard: false,
      isRequired: false
    };

    if (props.field) {
      const {
        type,
        options,
        locationOptions,
        objectListConfigs,
        searchable = false,
        showInCard = false,
        isRequired = false
      } = props.field;

      doc = {
        ...doc,
        type,
        searchable,
        showInCard,
        isRequired
      };

      if (
        type === 'select' ||
        type === 'multiSelect' ||
        type === 'radio' ||
        type === 'check'
      ) {
        doc = {
          type,
          hasOptions: true,
          options: Object.assign([], options || []),
          locationOptions: [],
          objectListConfigs: [],
          searchable: searchable || false,
          showInCard,
          isRequired
        };
      }

      if (type === 'map') {
        doc = {
          type,
          hasOptions: false,
          options: [],
          locationOptions: Object.assign([], locationOptions || []),
          objectListConfigs: Object.assign([], objectListConfigs || []),
          searchable: searchable || false,
          showInCard: false,
          isRequired
        };
      }

      if (objectListConfigs) {
        doc.objectListConfigs = objectListConfigs;
      }
    }

    this.state = {
      ...doc,
      currentLocation: { lat: 0, lng: 0 },
      add: false
    };
  }

  generateDoc = (values: {
    _id?: string;
    groupId: string;
    validation: string;
    text: string;
    description: string;
  }) => {
    const { field } = this.props;
    const {
      type,
      options,
      locationOptions,
      objectListConfigs,
      showInCard,
      searchable,
      isRequired
    } = this.state;

    const finalValues = values;

    if (field) {
      finalValues._id = field._id;
    }

    return {
      ...finalValues,
      contentType: this.props.type,
      type,
      options,
      locationOptions,
      objectListConfigs,
      searchable,
      showInCard,
      isRequired
    };
  };

  onChangeOption = options => {
    this.setState({ options });
  };

  onChangeLocationOptions = locationOptions => {
    this.setState({ locationOptions });
  };

  onChangeObjectListConfig = objectListConfigs => {
    this.setState({ objectListConfigs });
  };

  onRemoveOption = options => {
    this.setState({ options });
  };

  onTypeChange = e => {
    const value = e.target.value;
    let doc: { hasOptions: boolean; options: any[] } = {
      hasOptions: false,
      options: []
    };

    if (
      value === 'select' ||
      value === 'multiSelect' ||
      value === 'check' ||
      value === 'radio'
    ) {
      doc = { hasOptions: true, options: this.state.options };
    }

    this.setState({ type: value, ...doc });
  };

  onChangeSearchable = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ searchable: isChecked });
  };

  onSwitchChange = e => {
    this.setState({ showInCard: e.target.checked });
  };

  onChangeIsRequired = e => {
    this.setState({ isRequired: e.target.checked });
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

  renderObjectListConfigs = () => {
    if (this.state.type !== 'objectList') {
      return null;
    }

    const { objectListConfigs = [] } = this.state;

    return (
      <FormGroup>
        <ControlLabel>Object List Configs:</ControlLabel>

        <ObjectListConfigs
          objectListConfigs={objectListConfigs}
          onChange={this.onChangeObjectListConfig}
        />
      </FormGroup>
    );
  };

  renderLocationOptions = () => {
    if (this.state.type !== 'map') {
      return null;
    }

    const { currentLocation, locationOptions = [] } = this.state;

    return (
      <FormGroup>
        <ControlLabel htmlFor="locationOptions">Options:</ControlLabel>
        {locationOptions.length > 0 && (
          <Map
            id={this.props.field?._id || Math.random().toString(10)}
            center={currentLocation}
            locationOptions={locationOptions}
            streetViewControl={false}
            onChangeLocationOptions={this.onChangeLocationOptions}
            mode="config"
          />
        )}

        <LocationOptions
          locationOptions={locationOptions}
          onChange={this.onChangeLocationOptions}
        />
      </FormGroup>
    );
  };

  renderShowInCard = () => {
    const { type } = this.props;
    const { showInCard } = this.state;

    if (!['cards:deal', 'cards:ticket', 'cards:task'].includes(type)) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Show in card</ControlLabel>
        <Toggle
          checked={showInCard}
          onChange={this.onSwitchChange}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
      </FormGroup>
    );
  };

  renderIsRequied = () => {
    const { isRequired } = this.state;

    return (
      <FormGroup>
        <ControlLabel>Required</ControlLabel>
        <Toggle
          checked={isRequired}
          onChange={this.onChangeIsRequired}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
      </FormGroup>
    );
  };

  renderAddGroup = () => {
    const { queryParams } = this.props;

    const trigger = <Button>Create group</Button>;

    const content = props => (
      <PropertyGroupForm {...props} queryParams={queryParams} />
    );

    return (
      <ModalTrigger title="Create group" trigger={trigger} content={content} />
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { groups, closeModal, renderButton, field } = this.props;

    const object = field || ({} as IField);

    const { values, isSubmitted } = formProps;
    const { type, searchable } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name:</ControlLabel>
          <FormControl
            {...formProps}
            name="text"
            defaultValue={object.text || ''}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            defaultValue={object.description || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Code:</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Group:</ControlLabel>
          <Row>
            <FormControl
              {...formProps}
              name="groupId"
              componentClass="select"
              defaultValue={object.groupId || ''}
              required={true}
            >
              {groups
                .filter(e => !e.isDefinedByErxes)
                .map(group => {
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
            {...formProps}
            name="type"
            componentClass="select"
            value={type}
            onChange={this.onTypeChange}
            required={true}
          >
            <option />
            <option value="input">Input</option>
            <option value="list">String List</option>
            <option value="objectList">Object List</option>
            <option value="textarea">Text area</option>
            <option value="select">Select</option>
            <option value="multiSelect">Multiple select</option>
            <option value="check">Checkbox</option>
            <option value="radio">Radio button</option>
            <option value="file">File</option>
            <option value="customer">Customer</option>
            <option value="map">Location/Map</option>
          </FormControl>
        </FormGroup>
        {this.renderOptions()}
        {this.renderObjectListConfigs()}
        {this.renderLocationOptions()}
        {this.renderShowInCard()}
        {this.renderIsRequied()}

        <FormGroup>
          <ControlLabel>Validation:</ControlLabel>

          <FormControl
            {...formProps}
            componentClass="select"
            name="validation"
            defaultValue={object.validation || ''}
          >
            <option />
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <FormControl
            componentClass="checkbox"
            name="searchable"
            checked={searchable}
            onChange={this.onChangeSearchable}
          >
            {__('Searchable')}
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: 'property',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: field
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PropertyForm;
