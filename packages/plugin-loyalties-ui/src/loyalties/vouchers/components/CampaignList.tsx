import React from 'react';
import queryString from 'query-string';
import { DataWithLoader, Icon, Tip } from '@erxes/ui/src/components';
import { __, router } from '@erxes/ui/src/utils';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { IVoucherCampaign } from '../../../configs/voucherCampaign/types';
import { Link } from 'react-router-dom';
import { SidebarListItem } from '../../common/styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  refetch: any;
  voucherCampaigns: IVoucherCampaign[];
  voucherCampaignsCount: number;
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
    const { voucherCampaigns, queryParams } = this.props;

    const otherParams = { ...queryParams };
    delete otherParams.campaignId;
    const qryString = queryString.stringify(otherParams);

    const result: React.ReactNode[] = [];

    for (const campaign of voucherCampaigns || []) {
      const name = `${campaign.title} (${campaign.vouchersCount})`;

      let link;
      switch (campaign.voucherType) {
        case 'lottery':
          link = `/lotteries?${qryString}&voucherCampaignId=${campaign._id}`;
          break;

        case 'spin':
          link = `/spins?${qryString}&voucherCampaignId=${campaign._id}`;
          break;

        default:
          link = `?${qryString}&campaignId=${campaign._id}`;
      }

      result.push(
        <SidebarListItem
          key={campaign._id}
          isActive={this.isActive(campaign._id)}
        >
          <Link to={link}>{name}</Link>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
    return (
      <>
        <Section.Title>
          <Link to={`/erxes-plugin-loyalty/settings/voucher`}>
            <Icon icon="cog" />
            {__('Manage Voucher Campaigns')}
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
    const { voucherCampaignsCount, loading } = this.props;

    return (
      <DataWithLoader
        data={this.renderContent()}
        loading={loading}
        count={voucherCampaignsCount}
        emptyText="There is no voucher campaigns"
        emptyIcon="folder-2"
        size="small"
      />
    );
  }

  render() {
    return (
      <Sidebar>
        <Section
          maxHeight={188}
          collapsible={this.props.voucherCampaignsCount > 5}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
