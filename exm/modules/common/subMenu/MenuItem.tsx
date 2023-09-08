import NavLink from "next/link";
import React from "react";
import { colors } from "../../styles";
import { rgba } from "../../styles/ecolor";
import styled from "styled-components";

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
    position: relative;

    &.active::after {
      content: "";
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
};

function MenuItem({ to, title, children, ...props }: Props) {
  const linkProps = { href: to, title };

  return (
    <Item>
      <NavLink {...props} {...linkProps}>
        {children}
      </NavLink>
    </Item>
  );
}

export default MenuItem;
