import React from 'react';
import {
  __,
  DataWithLoader,
  Icon,
  router,
  Sidebar,
  Tip,
  Wrapper
} from 'erxes-ui';
import { IVoucherCompaign } from '../../../configs/voucherCompaign/types';
import { Link } from 'react-router-dom';
import { SidebarListItem } from '../../common/styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  refetch: any;
  voucherCompaigns: IVoucherCompaign[];
  voucherCompaignsCount: number;
  loading: boolean;
}

class List extends React.Component<IProps> {
  clearCategoryFilter = () => {
    router.setParams(this.props.history, { compaignId: null });
  };

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.compaignId || '';

    return currentGroup === id;
  };

  renderContent() {
    const { voucherCompaigns } = this.props;

    const result: React.ReactNode[] = [];

    for (const compaign of voucherCompaigns || []) {

      const name = `${compaign.title} (${compaign.vouchersCount})`

      result.push(
        <SidebarListItem
          key={compaign._id}
          isActive={this.isActive(compaign._id)}
        >
          <Link to={`?compaignType=voucher&compaignId=${compaign._id}`}>
            {name}
          </Link>
        </SidebarListItem>
      );
    }

    return result;
  }

  renderCategoryHeader() {
    return (
      <>
        <Section.Title>
          <Link
            to={`/erxes-plugin-loyalty/settings/voucher`}
          >
            <Icon icon="cog" />
            {__('Manage Voucher Compaigns')}
          </Link>
          <Section.QuickButtons>
            {router.getParam(this.props.history, 'compaignId') && (
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
    const {
      voucherCompaignsCount,
      loading
    } = this.props;

    return (
      <DataWithLoader
        data={this.renderContent()}
        loading={loading}
        count={voucherCompaignsCount}
        emptyText="There is no voucher compaigns"
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
          collapsible={this.props.voucherCompaignsCount > 5}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
