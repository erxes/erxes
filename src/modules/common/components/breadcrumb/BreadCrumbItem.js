import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
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
    content: '\\e810';
    font-family: 'erxes';
    padding: 0 ${dimensions.unitSpacing}px;
    color: ${rgba(colors.colorCoreDarkGray, 0.7)};
    font-size: 8px;
  }
`;

const propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  to: PropTypes.string,
  title: PropTypes.node,
  target: PropTypes.string
};

const defaultProps = {
  active: false
};

function BreadcrumbItem({ active, to, title, target, children, ...props }) {
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

BreadcrumbItem.propTypes = propTypes;
BreadcrumbItem.defaultProps = defaultProps;

export default BreadcrumbItem;
