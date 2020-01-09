import Button from 'modules/common/components/Button';
import FilterableList from 'modules/common/components/filterableList/FilterableList';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { dateUnits, types } from 'modules/customers/constants';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
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
    const field = items.find(item => item._id === id);

    this.props.addCondition({
      _id: Math.random().toString(),
      field: id,
      value: '',
      operator: '',
      dateUnit: dateUnits.days,
      type,
      brandId: field.brandId
    });

    this.overlayTrigger.hide();
  };

  renderItem(data, index: number) {
    return (
      <div key={index}>
        <FilterableList
          items={data}
          onClick={this.addCondition}
          showCheckmark={false}
        />
      </div>
    );
  }

  renderBrandList(items, title: string) {
    const data = Object.keys(items);

    return (
      <Field>
        <Popover.Title as="h3">{title}</Popover.Title>
        {data.map((key, index) => this.renderItem(items[key], index))}
      </Field>
    );
  }

  renderMessengerDataFields(items) {
    const groupedFields = items.reduce((total, item) => {
      const key = item.brandName;

      total[key] = total[key] || [];
      total[key].push(item);

      return total;
    }, {});

    return (
      <Field>
        <Popover.Title as="h3">{__('Select brand')}</Popover.Title>
        {Object.keys(groupedFields).map((key, index) => {
          let title = key;

          if (key === 'undefined') {
            title = __('Others');
          }

          return (
            <PopoverList key={index}>
              <FieldType>{title}</FieldType>
              {this.renderBrandList({ [key]: groupedFields[key] }, title)}
            </PopoverList>
          );
        })}
      </Field>
    );
  }

  renderFields(type: string, title: string) {
    const { fields } = this.props;

    let items = fields.filter(
      field =>
        field._id.indexOf('links') &&
        field._id.indexOf('customFieldsData') &&
        field._id.indexOf('messengerData')
    );

    if (type === 'customer-field-data') {
      items = fields.filter(field => field._id.includes('customFieldsData'));
    }

    if (type === 'other-properties') {
      items = fields.filter(field =>
        ['links'].some(e => field._id.includes(e))
      );
    }

    if (type === 'messenger-data') {
      items = fields.filter(field => field._id.includes('messengerData'));

      return this.renderMessengerDataFields(items);
    }

    return (
      <Field>
        <Popover.Title as="h3">{title}</Popover.Title>
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
          {__(title)}
          <Icon icon={icon} />
        </FieldType>
        {this.renderFields(type, title)}
      </PopoverList>
    );
  }

  renderPopover() {
    return (
      <Popover id="condition-popover">
        <Popover.Title as="h3">{__('Select a field')}</Popover.Title>
        <Popover.Content>
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
        </Popover.Content>
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
