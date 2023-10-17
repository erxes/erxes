import { NavLink } from 'react-router-dom';
import React from 'react';
import { colors } from '../../styles';
import { rgba } from '../../styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Item = styledTS<{ isLast?: boolean }>(styled.li)`
  display: inline-block;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  text-transform: capitalize;
  padding-right: ${props => (props.isLast ? '10px' : '40px')};

  > a {
    text-decoration: none;
    color: ${colors.colorCoreDarkGray};
    padding: 14px 0;
    display: block;
    position: relative;

    &.active::after {
      content: '';
      background: ${colors.colorSecondary};
      width: 100%;
      height: 2px;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }

  @media (max-width: 768px) {
    padding-right: 10px;
  }
`;

type Props = {
  children: React.ReactNode;
  to: string;
  title?: string;
  isLast?: boolean;
};

function MenuItem({ to, title, children, isLast, ...props }: Props) {
  const linkProps = { to, title };

  return (
    <Item isLast={isLast}>
      <NavLink {...props} {...linkProps} exact={true}>
        {children}
      </NavLink>
    </Item>
  );
}

export default MenuItem;
