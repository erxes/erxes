import Icon from '@erxes/ui/src/components/Icon';
import FormControl from '@erxes/ui/src/components/form/Control';
import React, { useRef } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
type Props = {
  onChange: (e) => void;
  link?: string;
};

function LinkAction({ onChange, link }: Props) {
  let overlay = useRef<any>(null);

  const renderOverlay = () => {
    return (
      <Popover id="attribute-popover">
        <FormControl
          onChange={onChange}
          value={link || ''}
          placeholder="type or paste link"
        />
      </Popover>
    );
  };

  return (
    <OverlayTrigger
      ref={overlay}
      trigger="click"
      placement="top"
      overlay={renderOverlay()}
      rootClose={true}
      container={this}
    >
      <span>
        <Icon icon="link" />
      </span>
    </OverlayTrigger>
  );
}

export default LinkAction;
