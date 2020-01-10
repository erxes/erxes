import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { INTEGRATIONS } from 'modules/settings/integrations/constants';
import React from 'react';
import Row from './Row';
import Sidebar from './Sidebar';
import { Content, IntegrationWrapper } from './styles';

type Props = {
  totalCount: {
    messenger: number;
    form: number;
    facebook: number;
    gmail: number;
    callpro: number;
    chatfuel: number;
    imap: number;
    office365: number;
    outlook: number;
    yahoo: number;
  };
  queryParams: any;
};

class Home extends React.Component<Props, { filteredItem: string }> {
  constructor(props) {
    super(props);

    this.state = {
      filteredItem: 'All integrations'
    };
  }

  getFilteredItem = (filteredItem: string) => {
    this.setState({ filteredItem });
  };

  renderIntegrations() {
    const { filteredItem } = this.state;
    const { totalCount, queryParams } = this.props;

    const datas = [] as any;

    const rows = [
      ...INTEGRATIONS.filter(
        integration =>
          integration.category &&
          integration.category.indexOf(filteredItem) !== -1
      )
    ];

    while (rows.length > 0) {
      datas.push(
        <Row
          key={rows.length}
          integrations={rows.splice(0, 4)}
          totalCount={totalCount}
          queryParams={queryParams}
        />
      );
    }

    return datas;
  }

  renderContent() {
    const { filteredItem } = this.state;

    return (
      <Content>
        <Sidebar
          getFilteredItem={this.getFilteredItem}
          filteredItem={filteredItem}
        />
        <IntegrationWrapper>
          <h3>{filteredItem}</h3>
          {this.renderIntegrations()}
        </IntegrationWrapper>
      </Content>
    );
  }

  render() {
    const breadcrumb = [{ title: __('App store') }];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('App store')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/33.svg"
                title="App store"
                description="Set up your integrations and start connecting with your customers. Now you can reach them on wherever platform they feel most comfortable."
              />
            }
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
