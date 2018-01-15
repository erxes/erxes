import React from 'react';
import PropTypes from 'prop-types';
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
    content: '\f3d3';
    font-family: 'Ionicons';
    padding: 0 ${dimensions.unitSpacing}px;
    color: ${rgba(colors.colorCoreDarkGray, 0.7)};
    font-size: 11px;
  }
`;

const propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  href: PropTypes.string,
  title: PropTypes.node,
  target: PropTypes.string
};

const defaultProps = {
  active: false
};

function BreadcrumbItem({ active, href, title, target, children, ...props }) {
  const linkProps = { href, title, target };

  return (
    <Item>
      {active ? (
        <span {...props}>{children}</span>
      ) : (
        <a {...props} {...linkProps}>
          {children}
        </a>
      )}
    </Item>
  );
}

BreadcrumbItem.propTypes = propTypes;
BreadcrumbItem.defaultProps = defaultProps;

export default BreadcrumbItem;
