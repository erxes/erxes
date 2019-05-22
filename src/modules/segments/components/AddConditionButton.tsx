import {
  Button,
  ControlLabel,
  FilterableList,
  Icon
} from 'modules/common/components';
import { dateUnits, types } from 'modules/customers/constants';
import * as React from 'react';
import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import { ISegmentCondition } from '../types';
import { Field, FieldType, PopoverList } from './styles';

type Props = {
  fields: any[];
  addCondition: (condition: ISegmentCondition) => void;
};

class AddConditionButton extends React.Component<Props> {
  private overlayTrigger;

  addCondition = (items, id: string) => {
    const [type] = Object.keys(types);

    this.props.addCondition({
      _id: Math.random().toString(),
      field: id,
      value: '',
      operator: '',
      dateUnit: dateUnits.days,
      type
    });

    this.overlayTrigger.hide();
  };

  renderFields(type: string, title: string) {
    const { fields } = this.props;

    let items = fields.filter(
      field =>
        field._id.indexOf('twitterData') &&
        field._id.indexOf('facebookData') &&
        field._id.indexOf('links') &&
        field._id.indexOf('customFieldsData') &&
        field._id.indexOf('messengerData')
    );

    if (type === 'messenger-data') {
      items = fields.filter(field => field._id.includes('messengerData'));
    }

    if (type === 'customer-field-data') {
      items = fields.filter(field => field._id.includes('customFieldsData'));
    }

    if (type === 'other-properties') {
      items = fields.filter(field =>
        ['twitterData', 'facebookData', 'links'].some(e =>
          field._id.includes(e)
        )
      );
    }

    return (
      <Field>
        <ControlLabel>{title}</ControlLabel>
        <FilterableList
          items={items}
          onClick={this.addCondition}
          showCheckmark={false}
        />
      </Field>
    );
  }

  renderFieldType(type: string, title: string, icon: string) {
    return (
      <PopoverList>
        <FieldType>
          {title}
          <Icon icon={icon} />
        </FieldType>
        {this.renderFields(type, title)}
      </PopoverList>
    );
  }

  renderPopover() {
    return (
      <Popover id="condition-popover" title="Select a field">
        {this.renderFieldType('basic-info', 'Basic Info', 'information')}
        {this.renderFieldType(
          'messenger-data',
          'Messenger data',
          'speech-bubble-2'
        )}
        {this.renderFieldType(
          'customer-field-data',
          'Customer field data',
          'user-1'
        )}
        {this.renderFieldType(
          'other-properties',
          'Other properties',
          'settings-3'
        )}
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        rootClose={true}
      >
        <Button btnStyle="success" icon="add">
          Add a condition
        </Button>
      </OverlayTrigger>
    );
  }
}

export default AddConditionButton;
