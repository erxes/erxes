import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { dimensions } from '../../styles';
import BreadCrumbItem from './BreadCrumbItem';

const Items = styled.ol`
  display: inline-block;
  padding: 0;
  margin: 0 ${dimensions.coreSpacing}px 0 0;
  list-style: none;
  font-size: 14px;
`;

const propTypes = {
  children: PropTypes.node
};

class BreadCrumb extends React.Component {
  render() {
    return (
      <Items role="navigation" aria-label="breadcrumbs">
        {this.props.children}
      </Items>
    );
  }
}

BreadCrumb.propTypes = propTypes;
BreadCrumb.Item = BreadCrumbItem;

export default BreadCrumb;
