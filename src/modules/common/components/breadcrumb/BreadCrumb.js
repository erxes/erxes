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
    const { __ } = this.context;
    const { breadcrumbs } = this.props;
    const page = breadcrumbs.pop();

    setTitle(
      page.title,
      page.title === `${__('Inbox')}` && document.title.startsWith('(1)')
    );
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
BreadCrumb.contextTypes = {
  __: PropTypes.func
};

export default BreadCrumb;
