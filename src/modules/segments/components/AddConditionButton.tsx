import { Button, FilterableList } from 'modules/common/components';
import { dateUnits, operators, types } from 'modules/customers/constants';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { ISegmentCondition } from '../types';

type Props = {
  fields: any[];
  addCondition: (condition: ISegmentCondition) => void;
};

class AddConditionButton extends React.Component<Props> {
  private overlayTrigger;

  constructor(props) {
    super(props);

    this.addCondition = this.addCondition.bind(this);
  }

  addCondition(items, id) {
    const [type] = Object.keys(types);
    const [operator] = operators[type];

    this.props.addCondition({
      dateUnit: dateUnits.days,
      field: id,
      operator: operator.value,
      type,
      value: ''
    });

    this.overlayTrigger.hide();
  }

  renderPopover() {
    return (
      <Popover id="condition-popover" title="Select a field">
        <FilterableList
          items={this.props.fields}
          onClick={this.addCondition}
          showCheckmark={false}
        />
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
        rootClose
      >
        <Button btnStyle="success" icon="add">
          Add a condition
        </Button>
      </OverlayTrigger>
    );
  }
}

export default AddConditionButton;
