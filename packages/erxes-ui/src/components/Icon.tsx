import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const IconStyle = styledTS<{ size?: number }>(styled.i)`
  font-size: ${props => (props.size ? `${props.size}px` : 'inherit')};
  color: ${props => props.color && props.color};
`;

type Props = {
  icon: string;
  size?: number;
  style?: any;
  color?: string;
  isActive?: boolean;
  id?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};

function Icon(props: Props) {
  const { isActive, color, className } = props;

  let changedColor = color || '';

  if (isActive) {
    changedColor = 'black';
  }

  return (
    <IconStyle
      {...props}
      className={`icon-${props.icon} ${className ? className : ''}`}
      color={changedColor}
    />
  );
}

export default Icon;
