import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { setTitle } from 'modules/common/utils';
import BreadCrumbItem from './BreadCrumbItem';
import { dimensions } from '../../styles';

const Items = styled.ol`
  display: inline-block;
  padding: 0;
  margin: 0 ${dimensions.coreSpacing}px 0 0;
  list-style: none;
  font-size: 14px;
`;

const propTypes = {
  breadcrumbs: PropTypes.array.isRequired
};

class BreadCrumb extends Component {
  setTabTitle() {
    const { breadcrumbs } = this.props;
    const page = breadcrumbs.pop();
    setTitle(page.title, page.title === 'Inbox');
  }

  componentDidUpdate() {
    this.setTabTitle();
  }

  componentDidMount() {
    this.setTabTitle();
  }

  render() {
    return (
      <Items role="navigation" aria-label="breadcrumbs">
        {this.props.breadcrumbs.map(b => (
          <BreadCrumbItem to={b.link} active={!b.link} key={b.title}>
            {b.title}
          </BreadCrumbItem>
        ))}
      </Items>
    );
  }
}

BreadCrumb.propTypes = propTypes;

export default BreadCrumb;
