import { Attributes } from '../styles';
import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import Icon from '@erxes/ui/src/components/Icon';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import { __ } from '@erxes/ui/src';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
  attributions: FieldsCombinedByType[];
  fieldType?: string;
  attrType?: string;
  attrTypes?: string[];
  onlySet?: boolean;
};

type State = {
  searchValue: string;
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export default class Attribution extends React.Component<Props, State> {
  private overlay: any;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: ''
    };
  }

  hideContent = () => {
    this.overlay.hide();
  };

  getComma = preValue => {
    if (this.props.fieldType === 'select' && preValue) {
      return ', ';
    }

    if (preValue) {
      return ' ';
    }

    return '';
  };

  onClickAttribute = item => {
    this.overlay.hide();

    const { config, setConfig, onlySet, inputName = 'value' } = this.props;

    if (onlySet) {
      config[inputName] = `{{ ${item.name} }}`;
    } else {
      config[inputName] = `${config[inputName] || ''}${this.getComma(
        config[inputName]
      )}{{ ${item.name} }}`;
    }

    setConfig(config);
  };

  renderContent() {
    const { attributions, attrType, attrTypes } = this.props;
    const { searchValue } = this.state;
    let filterAttrs = attributions;

    const onSearch = e => {
      const { value } = e.currentTarget as HTMLInputElement;

      this.setState({ searchValue: value });
    };

    if (attrType && attrType !== 'String') {
      filterAttrs = filterAttrs.filter(
        ({ type, validation = '' }) =>
          type === attrType || validation === attrType.toLowerCase()
      );
    }

    if (attrTypes?.length) {
      filterAttrs = filterAttrs.filter(
        ({ type, validation = '' }) =>
          attrTypes.includes(type) ||
          attrTypes.includes(capitalizeFirstLetter(validation))
      );
    }

    if (searchValue) {
      filterAttrs = filterAttrs.filter(option =>
        new RegExp(searchValue, 'i').test(option.label)
      );
    }

    return (
      <Popover id="attribute-popover">
        <Attributes>
          <React.Fragment>
            <FormGroup>
              <ControlLabel>{__('Search')}</ControlLabel>
              <FormControl
                placeholder="type a search"
                value={searchValue}
                onChange={onSearch}
              />
            </FormGroup>
            <li>
              <b>{__('Attributions')}</b>
            </li>
            {filterAttrs.map(item => (
              <li
                key={item.name}
                onClick={this.onClickAttribute.bind(this, item)}
              >
                {__(item.label)}
              </li>
            ))}
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlay => {
          this.overlay = overlay;
        }}
        trigger="click"
        placement="top"
        overlay={this.renderContent()}
        rootClose={true}
        container={this}
      >
        <span>
          {__('Attribution')} <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
