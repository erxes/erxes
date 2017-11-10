import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { FilterByParams, Icon, Button } from 'modules/common/components';
import { PopoverButton } from '../styles';
import { router } from 'modules/common/utils';

const propTypes = {
  fields: PropTypes.array.isRequired,
  popoverTitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  counts: PropTypes.object,
  history: PropTypes.object.isRequired,
  paramKey: PropTypes.string.isRequired,
  placement: PropTypes.string,
  icon: PropTypes.string
};

const defaultProps = {
  placement: 'bottom'
};

class FilterPopover extends Component {
  render() {
    const {
      history,
      buttonText,
      popoverTitle,
      placement,
      fields,
      paramKey,
      counts,
      icon
    } = this.props;

    const popover = (
      <Popover id="filter-popover" title={popoverTitle}>
        <FilterByParams
          fields={fields}
          paramKey={paramKey}
          counts={counts}
          icon={icon}
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
          {buttonText}
          <Icon
            icon={placement === 'top' ? 'ios-arrow-up' : 'ios-arrow-down'}
          />
          {router.getParam(history, [paramKey]) ? (
            <Button
              btnStyle="link"
              tabIndex={0}
              onClick={() => {
                router.setParams(history, { [paramKey]: null });
              }}
            >
              <Icon icon="close-circled" />
            </Button>
          ) : null}
        </PopoverButton>
      </OverlayTrigger>
    );
  }
}

FilterPopover.propTypes = propTypes;
FilterPopover.defaultProps = defaultProps;

export default withRouter(FilterPopover);
