import React from 'react';
import useContextMenu from 'modules/common/components/useContextMenu';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const GanttContextMenu = styledTS<{ top: number; left: number }>(
  styled.ul
)`
  font-size: 14px;
  background-color: #fff;
  border-radius: 2px;
  padding: 5px 0 5px 0;
  width: 150px;
  height: auto;
  margin: 0;
  /* use absolute positioning  */
  position: absolute;
  list-style: none;
  box-shadow: 0 0 20px 0 #ccc;
  opacity: 1;
  transition: opacity 0.5s linear;
  top: ${props => `${props.top}px`}
  left: ${props => `${props.left}px`}

  li {
    padding-left: 10px;
  }
`;

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
