import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { IBrand } from '../../settings/brands/types';
import { InsightContent, InsightTitle, InsightWrapper } from '../styles';
import { IQueryParams, SummaryData } from '../types';
import { InboxFilter, Sidebar, Summary } from './';

type Props = {
  brands: IBrand[];
  queryParams: IQueryParams;
  history: any;
  conversationReport: SummaryData[];
};

class ConversationReport extends React.Component<Props, { userId: string }> {
  constructor(props) {
    super(props);

    this.state = { userId: '' };
  }

  renderContent() {
    const { brands, history, queryParams, conversationReport } = this.props;

    return (
      <InsightWrapper>
        <InboxFilter
          history={history}
          brands={brands}
          queryParams={queryParams}
        />
        <InsightContent>
          <InsightTitle>{__('response frequency averages block')}</InsightTitle>
          <Summary data={conversationReport} loading={false} />
        </InsightContent>
      </InsightWrapper>
    );
  }

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('First Response Report')}
            submenu={menuInbox}
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default ConversationReport;
