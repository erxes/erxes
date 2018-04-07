import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FilterByParams, Icon } from 'modules/common/components';
import { PopoverButton } from '../../styles';

const propTypes = {
  fields: PropTypes.array.isRequired,
  popoverTitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  counts: PropTypes.object,
  paramKey: PropTypes.string.isRequired,
  placement: PropTypes.string,
  icon: PropTypes.string,
  searchable: PropTypes.bool
};

const defaultProps = {
  placement: 'bottom'
};

class FilterPopover extends Component {
  constructor(props) {
    super(props);

    this.update = this.update.bind(this);
  }

  // rerender component
  update() {
    this.forceUpdate();
  }

  render() {
    const {
      buttonText,
      popoverTitle,
      placement,
      fields,
      paramKey,
      counts,
      icon,
      searchable
    } = this.props;
    const { __ } = this.context;

    const popover = (
      <Popover id="filter-popover" title={__(popoverTitle)}>
        <FilterByParams
          fields={fields}
          paramKey={paramKey}
          counts={counts}
          icon={icon}
          loading={false}
          searchable={searchable}
          update={this.update}
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
        shouldUpdatePosition
        rootClose
      >
        <PopoverButton>
          {__(buttonText)}
          <Icon
            icon={placement === 'top' ? 'ios-arrow-up' : 'ios-arrow-down'}
          />
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

FilterPopover.propTypes = propTypes;
FilterPopover.defaultProps = defaultProps;
FilterPopover.contextTypes = {
  __: PropTypes.func
};

export default withRouter(FilterPopover);
