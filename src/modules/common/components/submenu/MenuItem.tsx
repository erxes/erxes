import * as React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { colors } from '../../styles';
import { rgba } from '../../styles/color';

const Item = styled.li`
  display: inline-block;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  text-transform: capitalize;
  padding-right: 40px;

  > a {
    text-decoration: none;
    color: ${colors.colorCoreDarkGray};
    padding: 14px 0;
    display: block;

    &.active {
      border-bottom: 2px solid ${colors.colorSecondary};
    }
  }
`;

type Props = {
  children: React.ReactNode;
  to: string;
  title?: string;
};

function MenuItem({ to, title, children, ...props }: Props) {
  const linkProps = { to, title };

  return (
    <Item>
      <NavLink {...props} {...linkProps} exact={true}>
        {children}
      </NavLink>
    </Item>
  );
}

export default MenuItem;
