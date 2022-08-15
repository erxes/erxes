import { Content, FullHeight, IntegrationWrapper, SearchInput } from './styles';

// import { ByKindTotalCount } from '../../types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { INTEGRATIONS } from './constants/integrations';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Row from './Row';
// import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';

type Props = {
  totalCount: any;
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
        integration => integration.category.indexOf('Payment method') !== -1
      )
    };

    console.log('Home constructor ...', INTEGRATIONS);
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
            integration.category.indexOf(queryParams.type || 'All add-ons') !==
              -1
        )
      });
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  renderIntegrations() {
    console.log('Home renderIntegrations ...');

    const { integrations, searchValue } = this.state;
    const { totalCount, queryParams, customLink } = this.props;
    const datas = [] as any;
    const rows = [...integrations];

    console.log('Home renderIntegrations1 ...', integrations, rows);

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
            text={`No results for1 "${searchValue}"`}
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
          placeholder={__('Type to search for an add-ons') + '...'}
          onChange={this.onSearch}
        />
      </SearchInput>
    );
  }

  render() {
    const { queryParams } = this.props;

    console.log('Home render ...');

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Add-ons') },
      { title: `${this.props.queryParams.type || __('All add-ons')}` }
    ];

    const headerDescription = (
      <HeaderDescription
        icon="/images/actions/33.svg"
        title="Add-ons"
        description={`${__(
          'Set up your add-ons and start connecting with your customers'
        )}.${__(
          'Now you can reach them on wherever platform they feel most comfortable'
        )}`}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Add-ons')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{queryParams.type || 'All Add-onsss'}</Title>}
            right={this.renderSearch()}
            withMargin={true}
            wide={true}
            background="colorWhite"
          />
        }
        mainHead={headerDescription}
        // leftSidebar={<Sidebar currentType={queryParams.type} />}
        content={
          <Content>
            <IntegrationWrapper>{this.renderIntegrations()}</IntegrationWrapper>
          </Content>
        }
        hasBorder={true}
        transparent={true}
        noPadding={true}
      />
    );
  }
}

export default Home;
