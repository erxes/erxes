import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const IconStyle = styledTS<{ size?: number }>(styled.i)`
  font-size: ${props => (props.size ? `${props.size}px` : 'inherit')};
  color: ${props => props.color && props.color};
`;

type Props = {
  icon: string,
  size?: number,
  isActive?: boolean
};

function Icon(props: Props) {
  const { isActive } = props;

  let color;

  if (isActive) {
    color = 'black';
  }

  return (
    <IconStyle {...props} className={`icon-${props.icon}`} color={color} />
  );
}

export default Icon;
