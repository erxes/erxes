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
import { Title } from 'modules/common/styles/main';

type Props = {
  totalCount: ByKindTotalCount;
  queryParams: any;
  customLink: (kind: string, addLink: string) => void;
};

type State = {
  searchValue: string;
  integrations: any;
};

class Home extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      integrations: INTEGRATIONS.filter(
        integration => integration.category.indexOf('All integrations') !== -1
      )
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchValue } = this.state;
    const { queryParams } = this.props;

    if (
      prevProps.queryParams.type !== queryParams.type ||
      prevState.searchValue !== searchValue
    ) {
      this.setState({
        integrations: INTEGRATIONS.filter(
          integration =>
            integration.name.toLowerCase().indexOf(searchValue) !== -1 &&
            integration.category.indexOf(
              queryParams.type || 'All integrations'
            ) !== -1
        )
      });
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  renderIntegrations() {
    const { integrations, searchValue } = this.state;
    const { totalCount, queryParams, customLink } = this.props;

    const datas = [] as any;
    const rows = [...integrations];

    while (rows.length > 0) {
      datas.push(
        <Row
          key={rows.length}
          integrations={rows.splice(0, 4)}
          totalCount={totalCount}
          customLink={customLink}
          queryParams={queryParams}
        />
      );
    }

    if (datas.length === 0) {
      return (
        <FullHeight>
          <EmptyState
            text={`No results for "${searchValue}"`}
            image="/images/actions/2.svg"
          />
        </FullHeight>
      );
    }

    return datas;
  }

  renderSearch() {
    return (
      <SearchInput isInPopover={false}>
        <Icon icon="search-1" />
        <FormControl
          type="text"
          placeholder={__('Type to search for an integration') + '...'}
          onChange={this.onSearch}
        />
      </SearchInput>
    );
  }

  render() {
    const { queryParams } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('App store') },
      { title: `${this.props.queryParams.type || __('All integrations')}` }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/33.svg"
        title="App store"
        description={`${__(
          'Set up your integrations and start connecting with your customers'
        )}.${__(
          'Now you can reach them on wherever platform they feel most comfortable'
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('App store')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{queryParams.type || 'All Integrations'}</Title>}
            right={this.renderSearch()}
          />
        }
        mainHead={headerDescription}
        leftSidebar={<Sidebar currentType={queryParams.type} />}
        content={
          <Content>
            <IntegrationWrapper>{this.renderIntegrations()}</IntegrationWrapper>
          </Content>
        }
      />
    );
  }
}

export default Home;
