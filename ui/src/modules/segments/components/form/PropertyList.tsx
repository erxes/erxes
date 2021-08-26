import { IBoard } from 'modules/boards/types';
import Select from 'react-select-plus';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import { IField, ISegmentCondition, ISegmentMap } from 'modules/segments/types';
import React from 'react';
import { PROPERTY_TYPES } from '../constants';
import PropertyForm from './PropertyForm';
import { FormControl } from 'modules/common/components/form';
import { OperatorList, SegmentBackIcon } from '../styles';
import Icon from 'modules/common/components/Icon';

type Props = {
  contentType: string;
  fields: IField[];
  boards?: IBoard[];
  onSearch: (value: string) => void;
  fetchFields: (propertyType: string, pipelineId?: string) => void;
  segment: ISegmentMap;
  addCondition: (condition: ISegmentCondition, segmentKey: string) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
};

type State = {
  propertyType: string;
  chosenField?: IField;
};

class PropertyList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const propertyType = props.contentType;

    this.state = { propertyType };
  }

  groupByType = () => {
    const { fields = [] } = this.props;

    return fields.reduce((acc, field) => {
      const value = field.value;
      let key;

      if (field.group) {
        key = field.group;
      } else {
        key =
          value && value.includes('.')
            ? value.substr(0, value.indexOf('.'))
            : 'general';
      }

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(field);

      return acc;
    }, {});
  };

  onClickField = field => {
    this.setState({ chosenField: field });
  };

  onClickBack = () => {
    this.setState({ chosenField: undefined });

    this.props.onSearch('');
  };

  renderFields = fields => {
    return fields.map(field => {
      return (
        <FormControl
          key={Math.random()}
          componentClass="checkbox"
          onChange={this.onClickField.bind(this, field)}
        >
          {field.label}
        </FormControl>
      );
    });
  };

  renderGroups = () => {
    const objects = this.groupByType();

    return Object.keys(objects).map(key => {
      return (
        <OperatorList key={Math.random()}>
          <FormGroup>
            <b>{key}</b>
            {this.renderFields(objects[key])}
          </FormGroup>
        </OperatorList>
      );
    });
  };

  renderFieldDetail = () => {
    const { chosenField, propertyType } = this.state;

    if (chosenField) {
      return (
        <PropertyForm
          {...this.props}
          onClickBack={this.onClickBack}
          propertyType={propertyType}
          field={chosenField}
        />
      );
    }

    return;
  };

  onSearch = e => {
    const value = e.target.value;

    this.props.onSearch(value);
  };

  render() {
    const {
      contentType,
      fetchFields,
      onClickBackToList,
      hideBackButton
    } = this.props;
    const { chosenField, propertyType } = this.state;

    const options = PROPERTY_TYPES[contentType];

    const onChange = e => {
      this.setState({ propertyType: e.value, chosenField: undefined });

      fetchFields(e.value);
    };

    const generateSelect = () => {
      return (
        <Select
          clearable={false}
          value={propertyType}
          options={options.map(option => ({
            value: option.value,
            label: option.label
          }))}
          onChange={onChange}
        />
      );
    };

    if (!chosenField) {
      return (
        <>
          {hideBackButton ? (
            <SegmentBackIcon onClick={onClickBackToList}>
              <Icon icon="angle-left" size={20} /> back
            </SegmentBackIcon>
          ) : (
            <></>
          )}

          <FormGroup>
            <ControlLabel>Property type</ControlLabel>
            {generateSelect()}
          </FormGroup>
          <FormGroup>
            <FormControl
              type="text"
              placeholder={__('Type to search')}
              onChange={this.onSearch}
              autoFocus={true}
            />
          </FormGroup>
          {this.renderGroups()}
        </>
      );
    }

    return (
      <>
        <SegmentBackIcon onClick={this.onClickBack}>
          <Icon icon="angle-left" size={20} /> back
        </SegmentBackIcon>
        <PropertyForm
          {...this.props}
          onClickBack={this.onClickBack}
          propertyType={propertyType}
          field={chosenField}
        />
      </>
    );
  }
}

export default PropertyList;
