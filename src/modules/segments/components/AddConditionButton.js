import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FilterableList, Button } from 'modules/common/components';
import { types, operators, dateUnits } from 'modules/customers/constants';

const propTypes = {
  fields: PropTypes.array.isRequired,
  addCondition: PropTypes.func.isRequired
};

class AddConditionButton extends Component {
  constructor(props) {
    super(props);

    this.addCondition = this.addCondition.bind(this);
  }

  addCondition(items, id) {
    const [type] = Object.keys(types);
    const [operator] = operators[type];
    const title = items.find(item => item._id === id).title;

    this.props.addCondition({
      field: title,
      value: '',
      operator: operator.value,
      dateUnit: dateUnits.days,
      type
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
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={popover}
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

AddConditionButton.propTypes = propTypes;

export default AddConditionButton;
