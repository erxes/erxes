import React from 'react';
import queryString from 'query-string';
import { DataWithLoader, Icon, Tip } from '@erxes/ui/src/components';
import { __, router } from '@erxes/ui/src/utils';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { ISpinCampaign } from '../../../configs/spinCampaign/types';
import { Link } from 'react-router-dom';
import { SidebarListItem } from '../../common/styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  refetch: any;
  spinCampaigns: ISpinCampaign[];
  spinCampaignsCount: number;
  loading: boolean;
}

class List extends React.Component<IProps> {
  clearCategoryFilter = () => {
    router.setParams(this.props.history, { campaignId: null });
  };

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.campaignId || '';

    return currentGroup === id;
  };

  renderContent() {
    const { spinCampaigns, queryParams } = this.props;

    const otherParams = { ...queryParams };
    delete otherParams.campaignId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const campaign of spinCampaigns || []) {
      const name = `${campaign.title} (${campaign.spinsCount})`;

      result.push(
        <SidebarListItem
          key={campaign._id}
          isActive={this.isActive(campaign._id)}
        >
          <Link to={`?${qryString}&campaignId=${campaign._id}`}>{name}</Link>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
    return (
      <>
        <Section.Title>
          <Link to={`/erxes-plugin-loyalty/settings/spin`}>
            <Icon icon="cog" />
            {__('Manage Spin Campaigns')}
          </Link>
          <Section.QuickButtons>
            {router.getParam(this.props.history, 'campaignId') && (
              <a href="#cancel" tabIndex={0} onClick={this.clearCategoryFilter}>
                <Tip text={__('Clear filter')} placement="bottom">
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
      </>
    );
  }

  renderCategoryList() {
    const { spinCampaignsCount, loading } = this.props;

    return (
      <DataWithLoader
        data={this.renderContent()}
        loading={loading}
        count={spinCampaignsCount}
        emptyText="There is no spin campaigns"
        emptyIcon="folder-2"
        size="small"
      />
    );
  }

  render() {
    return (
      <Sidebar hasBorder>
        <Section
          maxHeight={188}
          collapsible={this.props.spinCampaignsCount > 5}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
