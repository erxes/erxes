import { IField, ISegmentCondition, ISegmentMap } from '../../types';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import Icon from '@erxes/ui/src/components/Icon';
import PropertyForm from './PropertyForm';
import PropertyList from '../../containers/form/PropertyList';
import React from 'react';
import { RenderDynamicComponent } from '@erxes/ui/src/utils/core';
import { SegmentBackIcon } from '../styles';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  contentType: string;
  associationTypes: any[];
  forms?: IIntegration[];
  segment: ISegmentMap;
  addCondition: (condition: ISegmentCondition, segmentKey: string) => void;
  onClickBackToList: () => void;
  hideBackButton: boolean;
  hideDetailForm: boolean;
  changeSubSegmentConjunction: (
    segmentKey: string,
    conjunction: string
  ) => void;
  config?: any;
};

type State = {
  propertyType: string;
  chosenProperty?: IField;
  searchValue: string;

  config: any;
};

class PropertyCondition extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { contentType, config = {} } = props;

    this.state = {
      propertyType: contentType,
      searchValue: '',
      config
    };
  }

  onClickProperty = field => {
    this.setState({ chosenProperty: field });
  };

  onClickBack = () => {
    this.setState({ chosenProperty: undefined, searchValue: '' });
  };

  onSearch = e => {
    const value = e.target.value;

    this.setState({ searchValue: value });
  };

  onChangeConfig = config => {
    this.setState({ config });
  };

  renderExtraContent = () => {
    const { contentType, hideDetailForm } = this.props;
    const { config, propertyType } = this.state;

    const plugins: any[] = (window as any).plugins || [];

    for (const plugin of plugins) {
      if (propertyType.includes(`${plugin.name}:`) && plugin.segmentForm) {
        return (
          <RenderDynamicComponent
            scope={plugin.scope}
            component={plugin.segmentForm}
            injectedProps={{
              config,
              type: contentType,
              propertyType,
              onChangeConfig: this.onChangeConfig,
              hideDetailForm,
              component: 'filter'
            }}
          />
        );
      }
    }

    return null;
  };

  render() {
    const { associationTypes, onClickBackToList, hideBackButton } = this.props;

    const { chosenProperty, propertyType, searchValue, config } = this.state;

    const onChange = e => {
      const value = e.value;

      this.setState({ propertyType: value, chosenProperty: undefined });
    };

    const generateSelect = () => {
      return (
        <Select
          clearable={false}
          value={propertyType}
          options={associationTypes.map(option => ({
            value: option.value,
            label: option.description
          }))}
          onChange={onChange}
        />
      );
    };

    if (!chosenProperty) {
      return (
        <>
          {hideBackButton ? (
            <></>
          ) : (
            <SegmentBackIcon onClick={onClickBackToList}>
              <Icon icon="angle-left" size={20} /> back
            </SegmentBackIcon>
          )}

          <FormGroup>
            <ControlLabel>Property type</ControlLabel>
            {generateSelect()}
          </FormGroup>
          {this.renderExtraContent()}
          <FormGroup>
            <ControlLabel>Properties</ControlLabel>
            <FormControl
              type="text"
              placeholder={__('Type to search')}
              onChange={this.onSearch}
            />
          </FormGroup>
          <PropertyList
            config={config}
            onClickProperty={this.onClickProperty}
            contentType={propertyType}
            searchValue={searchValue}
          />
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
          segmentKey={this.props.segment.key}
          propertyType={propertyType}
          field={chosenProperty}
          config={config}
        />
      </>
    );
  }
}

export default PropertyCondition;
