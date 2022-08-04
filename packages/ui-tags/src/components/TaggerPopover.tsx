import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import Tagger from '../containers/Tagger';
import { __ } from 'coreui/utils';

type Props = {
  type: string;
  trigger: React.ReactNode;
  successCallback?: () => void;
  targets?: any[];
  container?: Element | Node | React.Component<any, {}, any>;
  refetchQueries?: any[];
};

function TaggerPopover(props: Props) {
  const { trigger, container, refetchQueries, ...taggerProps } = props;

  const popover = (
    <Popover id="tags-popover">
      <Popover.Title as="h3">{__('Choose your tags')}</Popover.Title>
      <Popover.Content>
        <Tagger
          event="onExit"
          {...taggerProps}
          refetchQueries={refetchQueries}
        />
      </Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      overlay={popover}
      container={container}
      rootClose={true}
    >
      {trigger}
    </OverlayTrigger>
  );
}

export default TaggerPopover;
