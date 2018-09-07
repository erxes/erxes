import * as React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Tagger } from '../containers';

const propTypes = {
  trigger: PropTypes.element.isRequired,
  container: PropTypes.element
};

const contextTypes = {
  __: PropTypes.func
};

function TaggerPopover(props, { __ }) {
  const { trigger, container, ...taggerProps } = props;

  const popover = (
    <Popover id="tags-popover" title={__('Choose your tags')}>
      <Tagger event="onExit" {...taggerProps} />
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      overlay={popover}
      container={container}
      rootClose
    >
      {trigger}
    </OverlayTrigger>
  );
}

TaggerPopover.propTypes = propTypes;
TaggerPopover.contextTypes = contextTypes;

export default TaggerPopover;
