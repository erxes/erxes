import React from 'react';
import queryString from 'query-string';
import {
  DataWithLoader,
  Icon,
  Tip} from '@erxes/ui/src/components';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
import { __, router } from '@erxes/ui/src/utils';
import { IDonateCompaign } from '../../../configs/donateCompaign/types';
import { Link } from 'react-router-dom';
import { SidebarListItem } from '../../common/styles';

const { Section } = Wrapper.Sidebar;

interface IProps {
  history: any;
  queryParams: any;
  refetch: any;
  donateCompaigns: IDonateCompaign[];
  donateCompaignsCount: number;
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
    const { donateCompaigns, queryParams } = this.props;

    const otherParams = { ...queryParams };
    delete otherParams.compaignId;
    const qryString = queryString.stringify(otherParams)

    const result: React.ReactNode[] = [];

    for (const compaign of donateCompaigns || []) {

      const name = `${compaign.title} (${compaign.donatesCount})`

      result.push(
        <SidebarListItem
          key={compaign._id}
          isActive={this.isActive(compaign._id)}
        >
          <Link to={`?${qryString}&compaignId=${compaign._id}`}>
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
            to={`/erxes-plugin-loyalty/settings/donate`}
          >
            <Icon icon="cog" />
            {__('Manage Donate Compaigns')}
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
      donateCompaignsCount,
      loading
    } = this.props;

    return (
      <DataWithLoader
        data={this.renderContent()}
        loading={loading}
        count={donateCompaignsCount}
        emptyText="There is no donate compaigns"
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
          collapsible={this.props.donateCompaignsCount > 5}
        >
          {this.renderCategoryHeader()}
          {this.renderCategoryList()}
        </Section>
      </Sidebar>
    );
  }
}

export default List;
