import { IBreadCrumbItem } from 'modules/common/types';
import { __, setTitle } from 'modules/common/utils';
import * as React from 'react';
import styled from 'styled-components';
import { dimensions } from '../../styles';
import BreadCrumbItem from './BreadCrumbItem';

const Items = styled.ul`
  display: inline-block;
  padding: 0;
  margin: 0 ${dimensions.coreSpacing}px 0 0;
  list-style: none;
  font-size: 14px;
`;

class BreadCrumb extends React.Component<{
  breadcrumbs: IBreadCrumbItem[];
}> {
  setTabTitle() {
    const { breadcrumbs } = this.props;
    const page = breadcrumbs.pop();

    if (page) {
      setTitle(
        page.title,
        page.title === `${__('Inbox')}` && document.title.startsWith('(1)')
      );
    }
  }

  componentDidUpdate() {
    this.setTabTitle();
  }

  componentDidMount() {
    this.setTabTitle();
  }

  render() {
    const { breadcrumbs } = this.props;

    return (
      <Items role="navigation" aria-label="breadcrumbs">
        {breadcrumbs.map(b => (
          <BreadCrumbItem to={b.link || ''} active={!b.link} key={b.title}>
            {b.title}
          </BreadCrumbItem>
        ))}
      </Items>
    );
  }
}

export default BreadCrumb;
