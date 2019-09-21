import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors, dimensions } from '../../styles';
import { rgba } from '../../styles/color';

const Item = styled.li`
  display: inline-block;
  color: ${rgba(colors.colorCoreDarkGray, 0.9)};
  text-transform: capitalize;

  > a {
    text-decoration: none;
    color: ${colors.colorCoreDarkGray};
  }

  & + li::before {
    content: '\\e9c2';
    font-family: 'erxes';
    padding: 0 ${dimensions.unitSpacing}px;
    color: ${rgba(colors.colorCoreDarkGray, 0.7)};
    font-size: 10px;
  }
`;

type Props = {
  children: React.ReactNode;
  active?: boolean;
  to: string;
  title?: string;
  target?: string;
};

function BreadcrumbItem({
  active,
  to,
  title,
  target,
  children,
  ...props
}: Props) {
  const linkProps = { to, title, target };

  return (
    <Item>
      {active ? (
        <span {...props}>{children}</span>
      ) : (
        <Link {...props} {...linkProps}>
          {children}
        </Link>
      )}
    </Item>
  );
}

export default BreadcrumbItem;
