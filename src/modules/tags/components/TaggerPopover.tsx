import { __ } from 'modules/common/utils';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Tagger } from '../containers';

type Props = {
  type: string;
  trigger: React.ReactNode;
  successCallback?: () => void;
  targets?: any[];
  container?: React.ReactNode;
  refetchQueries?: any[];
};

function TaggerPopover(props: Props) {
  const { trigger, container, refetchQueries, ...taggerProps } = props;

  const popover = (
    <Popover id="tags-popover" title={__('Choose your tags')}>
      <Tagger event="onExit" {...taggerProps} refetchQueries={refetchQueries} />
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
