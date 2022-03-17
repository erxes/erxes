import { IBreadCrumbItem } from '../../types';
import React from 'react';
import styled from 'styled-components';
import { dimensions } from '../../styles';
import NewBreadCrumbItem from './NewBreadCrumbItem';

const Items = styled.ul`
  display: inline-block;
  padding: 0;
  margin: 0 ${dimensions.coreSpacing}px 0 5px;
  list-style: none;
  font-size: 14px;
  @media (max-width: 560px) {
    display: none;
  }
`;

class BreadCrumb extends React.Component<{
  breadcrumbs: IBreadCrumbItem[];
}> {
  render() {
    const { breadcrumbs } = this.props;

    return (
      <Items role="navigation" aria-label="breadcrumbs">
        {breadcrumbs.map(b => (
          <NewBreadCrumbItem to={b.link || ''} active={!b.link} key={b.title}>
            {b.title}
          </NewBreadCrumbItem>
        ))}
      </Items>
    );
  }
}

export default BreadCrumb;