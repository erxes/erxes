import { Button, FilterableList } from 'modules/common/components';
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

  renderFields(type: string) {
    const { fields } = this.props;

    let items = fields.filter(
      field =>
        field._id !==
        field._id.includes(
          'links' &&
            'messengerData' &&
            'twitterData' &&
            'facebookData' &&
            'customFieldsData'
        )
    );

    if (type === 'messenger-data') {
      items = fields.filter(
        field => field._id === field._id.includes('messengerData')
      );
    }

    if (type === 'customer-field-data') {
      items = fields.filter(
        field => field._id === field._id.includes('customFieldsData')
      );
    }

    if (type === 'other-properties') {
      items = fields.filter(
        field =>
          field._id ===
          field._id.includes('twitterData' && 'facebookData' && 'links')
      );
    }
    // tslint:disable-next-line:no-console
    console.log(
      fields.filter(field =>
        [
          'links',
          'messengerData',
          'twitterData',
          'facebookData',
          'customFieldsData'
        ].some(e => !field._id.includes(e))
      )
    );
    return (
      <Field>
        <FilterableList
          items={items}
          onClick={this.addCondition}
          showCheckmark={false}
        />
      </Field>
    );
  }

  renderFieldType(type: string, title: string) {
    return (
      <PopoverList>
        <FieldType>{title}</FieldType>
        {this.renderFields(type)}
      </PopoverList>
    );
  }

  renderPopover() {
    return (
      <Popover id="condition-popover" title="Select a field">
        {this.renderFieldType('basic-info', 'Basic Info')}
        {this.renderFieldType('messenger-data', 'Messenger data')}
        {this.renderFieldType('customer-field-data', 'Customer field data')}
        {this.renderFieldType('other-properties', 'Other properties')}
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
