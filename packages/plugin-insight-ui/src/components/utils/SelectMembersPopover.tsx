import React, { useRef } from 'react';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { __ } from '@erxes/ui/src/utils/index';

import SelectMembersBox from '../../containers/utils/SelectMembersBox';
import { IDashboard, IReport } from '../../types';
import '../../styles.css';

type Props = {
  targets: IReport[] | IDashboard[];
  trigger: React.ReactNode;
  type: string;
};

const SelectMembersPopover = (props: Props) => {
  const { targets, trigger, type } = props;
  const overlayTriggerRef = useRef<any>(null);

  const popover = (
    <Popover id={'assign-popover'} className="custom-popover">
      <Popover.Title as="h3">{__('Choose person')}</Popover.Title>
      <Popover.Content>
        <SelectMembersBox targets={targets} type={type} />
      </Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger
      ref={(overlayTrigger) => {
        overlayTriggerRef.current = overlayTrigger;
      }}
      trigger="click"
      placement="bottom-end"
      overlay={popover}
      rootClose={true}
    >
      {trigger}
    </OverlayTrigger>
  );
};

export default SelectMembersPopover;
