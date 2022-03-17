import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors, dimensions } from '../../styles';
// import { rgba } from '../../styles/ecolor';

const Item = styled.li`
  display: inline-block;
  color: ${colors.colorShadowGray};
  text-transform: capitalize;
  > a {
    text-decoration: none;
    color: ${colors.colorCoreDarkGray};
  }
  & + li::before {
    content: '/';
    font-family: 'erxes';
    padding: 0 ${dimensions.unitSpacing / 2}px;
    color: ${colors.colorCoreDarkGray};
    font-size: 17px;
    font-weight: 500;
  }
`;

type Props = {
  children: React.ReactNode;
  active?: boolean;
  to: string;
  title?: string;
  target?: string;
};

function NewBreadcrumbItem({
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
        <span style={{fontWeight: 500, color:'black'}} {...props}>{children}</span>
      ) : (
        <Link {...props} {...linkProps} style={{color:"grey"}}>
          {children}
        </Link>
      )}
    </Item>
  );
}

export default NewBreadcrumbItem;