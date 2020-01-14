import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { INTEGRATIONS } from 'modules/settings/integrations/constants';
import React from 'react';
import { ByKindTotalCount } from '../../types';
import Row from './Row';
import Sidebar from './Sidebar';
import { Content, FullHeight, IntegrationWrapper, SearchInput } from './styles';

type Props = {
  totalCount: ByKindTotalCount;
  queryParams: any;
};

type State = {
  filteredItem: string;
  searchValue: string;
  rows: any;
};

class Home extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      filteredItem: 'All integrations',
      searchValue: '',
      rows: INTEGRATIONS.filter(
        integration => integration.category.indexOf('All integrations') !== -1
      )
    };
  }

  getFilteredItem = (filteredItem: string) => {
    this.setState({ filteredItem });
  };

  componentDidUpdate(prevProps, prevState) {
    const { searchValue, filteredItem } = this.state;

    if (prevState.filteredItem !== filteredItem ||
      prevState.searchValue !== searchValue) {
      this.setState({
        rows: INTEGRATIONS.filter(integration => (
          integration.name.toLowerCase().indexOf(searchValue) !== -1 &&
          integration.category.indexOf(filteredItem) !== -1
        ))
      })
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  renderIntegrations() {
    const { rows, searchValue } = this.state;
    const { totalCount, queryParams } = this.props;

    const datas = [] as any;

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

    if (datas.length === 0) {
      return (
        <FullHeight>
          <EmptyState
            text={`No results for "${searchValue}"`}
            image='/images/actions/2.svg'
          />
        </FullHeight>
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

  renderSearch() {
    return (
      <SearchInput>
        <Icon icon="search" />
        <FormControl
          type="text"
          placeholder={__('Type to search for an integration...')}
          onChange={this.onSearch}
        />
      </SearchInput>
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
            right={this.renderSearch()}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
