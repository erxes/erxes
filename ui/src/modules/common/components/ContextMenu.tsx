import React from 'react';
import useContextMenu from 'modules/common/components/useContextMenu';
import { GanttContextMenu } from 'modules/boards/styles/viewtype';

type Props = {
  elementId: string;
  show?: boolean;
  children: React.ReactNode;
};

const ContextMenu = (props: Props) => {
  const { anchorPoint, show } = useContextMenu({
    elementId: props.elementId,
    show: props.show
  });

  if (show) {
    return (
      <GanttContextMenu top={anchorPoint.y} left={anchorPoint.x}>
        {props.children}
      </GanttContextMenu>
    );
  }
  return <></>;
};

export default ContextMenu;
