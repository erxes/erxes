import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FilterableList, Icon } from 'modules/common/components';
import { PopoverButton } from '../styles';

const propTypes = {
  fields: PropTypes.array.isRequired,
  filter: PropTypes.func.isRequired,
  popoverTitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  placement: PropTypes.string
};

const defaultProps = {
  placement: 'bottom'
};

class FilterButton extends Component {
  constructor(props) {
    super(props);

    this.filter = this.filter.bind(this);
  }

  filter() {
    this.props.filter({});
    this.overlayTrigger.hide();
  }

  render() {
    const { buttonText, popoverTitle, placement } = this.props;
    const popover = (
      <Popover id="filter-popover" title={popoverTitle}>
        <FilterableList
          items={this.props.fields}
          onClick={this.filterByChannel}
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
        placement={placement}
        overlay={popover}
        container={this}
        rootClose
      >
        <PopoverButton>
          {buttonText}{' '}
          <Icon
            icon={placement === 'top' ? 'ios-arrow-up' : 'ios-arrow-down'}
          />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

FilterButton.propTypes = propTypes;
FilterButton.defaultProps = defaultProps;

export default FilterButton;
