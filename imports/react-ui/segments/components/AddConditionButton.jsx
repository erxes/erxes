import React, { PropTypes, Component } from 'react';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { FilterableList } from '/imports/react-ui/common';
import { types, operators } from '/imports/api/customers/constants';


const propTypes = {
  fields: PropTypes.array.isRequired,
  addCondition: PropTypes.func.isRequired,
};

class AddConditionButton extends Component {
  constructor(props) {
    super(props);

    this.addCondition = this.addCondition.bind(this);
  }

  addCondition(items, id) {
    const [type] = Object.keys(types);
    const [operator] = operators[type];

    this.props.addCondition({
      field: id,
      value: '',
      operator: operator.value,
      type,
    });
    this.overlayTrigger.hide();
  }

  render() {
    const popover = (
      <Popover id="condition-popover" title="Select a field">
        <FilterableList
          items={this.props.fields}
          onClick={this.addCondition}
          showCheckmark={false}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        ref={(overlayTrigger) => { this.overlayTrigger = overlayTrigger; }}
        trigger="click"
        placement="bottom"
        overlay={popover}
        rootClose
      >
        <Button bsSize="sm">Add a condition</Button>
      </OverlayTrigger>
    );
  }
}

AddConditionButton.propTypes = propTypes;

export default AddConditionButton;
