import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import ModifiableList from 'modules/common/components/ModifiableList';
import { MapContainer, ModalFooter } from 'modules/common/styles/main';
import {
  IButtonMutateProps,
  IFormProps,
  ILocationOption
} from 'modules/common/types';
import { Row } from 'modules/settings/integrations/styles';
import React from 'react';
import PropertyGroupForm from '../containers/PropertyGroupForm';
import { IField, IFieldGroup } from '../types';
import LocationOptions from './LocationOptions';
import Map from 'modules/common/components/Map';

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
  type: string;
  hasOptions: boolean;
  add: boolean;
  currentLocation: ILocationOption;
};

class PropertyForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let doc = {
      options: [],
      type: '',
      locationOptions: [],
      hasOptions: false
    };

    if (props.field) {
      const { type, options, locationOptions } = props.field;

      doc = {
        ...doc,
        type
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
          locationOptions: []
        };
      }

      if (type === 'map') {
        doc = {
          type,
          hasOptions: false,
          options: [],
          locationOptions: Object.assign([], locationOptions || [])
        };
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
    const { field, type } = this.props;

    const finalValues = values;

    if (field) {
      finalValues._id = field._id;
    }

    return {
      ...finalValues,
      type: this.state.type,
      options: this.state.options,
      locationOptions: this.state.locationOptions,
      contentType: type
    };
  };

  onChangeOption = options => {
    this.setState({ options });
  };

  onChangeLocationOption = locationOptions => {
    this.setState({ locationOptions });
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

  renderLocationOptions = () => {
    if (this.state.type !== 'map') {
      return null;
    }

    const { currentLocation, locationOptions = [] } = this.state;

    return (
      <FormGroup>
        <ControlLabel htmlFor="locationOptions">Options:</ControlLabel>
        {locationOptions.length > 0 && (
          <MapContainer>
            <Map
              center={currentLocation}
              googleMapApiKey={localStorage.getItem('GOOGLE_MAP_API_KEY') || ''}
              defaultZoom={7}
              locationOptions={locationOptions}
              mapControlOptions={{
                controlSize: 30,
                zoomControl: true,
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: true
              }}
              isPreview={true}
              onChangeLocationOptions={this.onChangeLocationOption}
            />
          </MapContainer>
        )}

        <LocationOptions
          locationOptions={locationOptions}
          onChange={this.onChangeLocationOption}
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
    const { type } = this.state;

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
        {this.renderLocationOptions()}

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
