import { Content, SiteBox, SitePreview, Sites } from './styles';

import { ISiteDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  sites: ISiteDoc[];
  getActionBar: (actionBar: any) => void;
  remove: (_id: string) => void;
  setCount: (count: number) => void;
  sitesCount: number;
  queryParams: any;
};

class SiteList extends React.Component<Props, {}> {
  renderList(site: ISiteDoc) {
    return (
      <SiteBox key={site._id}>
        <SitePreview>
          <img src="/images/usingGuide.png" alt="site-img" />
        </SitePreview>
        <Content>
          <div>
            <b>{site.name}</b>
            <span>{site.domain}</span>
          </div>
          <Icon icon="ellipsis-h" size={18} />
        </Content>
      </SiteBox>
    );
  }

  render() {
    const { sites } = this.props;
    console.log(sites);

    return <Sites>{(sites || []).map(site => this.renderList(site))}</Sites>;
  }
}

export default SiteList;
