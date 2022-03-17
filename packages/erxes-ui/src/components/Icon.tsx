import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';

const IconStyle = styledTS<{ bordered?: boolean, size?: number }>(styled.i)`
  font-size: ${props => (props.size ? `${props.size}px` : 'inherit')};
  color: ${props => props.color && props.color};
  border: ${props => props.bordered && `1px solid ${colors.darkShadow}`};
  padding: ${props => props.bordered && `12px`};
  border-radius: ${props => props.bordered && `8px`};
`;

type Props = {
  icon: string;
  size?: number;
  style?: any;
  color?: string;
  isActive?: boolean;
  bordered?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};

function Icon(props: Props) {
  const { isActive, color } = props;

  let changedColor = color || '';

  if (isActive) {
    changedColor = 'black';
  }

  return (
    <IconStyle
      {...props}
      className={`icon-${props.icon}`}
      color={changedColor}
    />
  );
}

export default Icon;
