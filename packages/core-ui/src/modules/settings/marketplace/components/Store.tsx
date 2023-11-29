import {
  Container,
  EmptyContent,
  FilterContainer,
  FlexWrapContainer,
  Labels,
  SearchBar,
  SearchIcon,
  SearchInput,
  Services,
  StoreBlock,
  Tag
} from './styles';

import { CATEGORIES } from '../constants';
import EmptyState from 'modules/common/components/EmptyState';
import { FlexRow } from '@erxes/ui/src/components/filterableList/styles';
import Icon from 'modules/common/components/Icon';
import PluginBox from './PluginBox';
import React from 'react';
import ServiceBox from './ServiceBox';
import Wrapper from 'modules/layout/components/Wrapper';
import { __ } from 'modules/common/utils';

type Props = {
  plugins: any;
};

type State = {
  status: string;
  searchValue: string;
  plugins: any;
  selectedCategories: any[];
};

class Store extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      plugins: props.plugins || [],
      status: 'All',
      searchValue: '',
      selectedCategories: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchValue, selectedCategories } = this.state;

    if (prevState.searchValue !== searchValue) {
      this.setState({
        plugins: this.props.plugins.filter(
          plugin => plugin.title.toLowerCase().indexOf(searchValue) !== -1
        )
      });
    }

    if (prevState.selectedCategories !== selectedCategories) {
      return this.onFilterByCategories();
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  handleStatus = (status: string) => {
    this.setState({ status });
  };

  handleCategory = (cat: any) => {
    const { selectedCategories } = this.state;

    let datas = [] as any;

    if (selectedCategories.includes(cat)) {
      datas = selectedCategories.filter(val => val !== cat);
    } else {
      datas.push(...selectedCategories, cat);
    }

    this.setState({ selectedCategories: datas });
  };

  onFilterByCategories() {
    const { selectedCategories } = this.state;
    let plugins = [];

    plugins = (this.props.plugins || []).filter(plugin => {
      const categories = (plugin.categories || []).filter(cat =>
        selectedCategories.includes(cat)
      );

      if (categories.length === 0 && selectedCategories.length !== 0) {
        return null;
      }

      return categories;
    });

    this.setState({
      plugins
    });
  }

  renderPlugins() {
    const { plugins } = this.state;

    if (!plugins || plugins.length === 0) {
      return (
        <EmptyContent>
          <EmptyState
            text={__(`Sorry, We don't have any suitable plugins at the moment`)}
            image={`/images/actions/30.svg`}
          />
        </EmptyContent>
      );
    }

    return plugins.map((plugin, index) => {
      if (
        !plugin ||
        !(plugin.displayLocations || []).includes('os') ||
        (plugin.mainType || '') === 'service'
      ) {
        return null;
      }

      return (
        <PluginBox
          key={index}
          plugin={plugin}
          plugins={plugins}
          isOpenSource={true}
        />
      );
    });
  }

  renderServices() {
    const { plugins = [] } = this.state;

    if (!plugins || plugins.length === 0) {
      return (
        <EmptyContent>
          <EmptyState
            text={__(
              `Sorry, We don't have any suitable services at the moment`
            )}
            image={`/images/actions/25.svg`}
          />
        </EmptyContent>
      );
    }

    return plugins.map((plugin, index) => (
      <ServiceBox key={index} plugin={plugin} />
    ));
  }

  renderCategories(cat: any, index: number) {
    const isActive = this.state.selectedCategories.includes(cat.value);

    return (
      <Tag
        key={index}
        onClick={() => this.handleCategory(cat.value)}
        isActive={isActive}
      >
        {cat.label}
        {isActive && (
          <Icon
            icon="cancel-1"
            size={11}
            onClick={() => this.handleCategory(cat.value)}
          />
        )}
      </Tag>
    );
  }

  renderContent() {
    return (
      <Container>
        <FlexRow>
          <SearchBar>
            <FlexRow>
              <SearchIcon>
                <Icon icon="search" />
              </SearchIcon>
              <SearchInput
                placeholder={__('Type to search for an results') + '...'}
                type="text"
                onChange={this.onSearch}
              />
            </FlexRow>
          </SearchBar>

          <FilterContainer noPadding={true}>
            <Labels>
              {CATEGORIES.map((cat, index) =>
                this.renderCategories(cat, index)
              )}
            </Labels>
          </FilterContainer>
        </FlexRow>

        <StoreBlock>
          <h4>{__('Services')}</h4>
          <p>
            {__(
              'Upgrade your plan with these premium services for expert help and guidance'
            )}
          </p>
          <Services>{this.renderServices()}</Services>
        </StoreBlock>

        <StoreBlock>
          <h4>{__('Plugins')}</h4>
          <p>{__('Customize and enhance your plugins limits')}</p>
          <FlexWrapContainer>{this.renderPlugins()}</FlexWrapContainer>
        </StoreBlock>
      </Container>
    );
  }

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Marketplace')}
            breadcrumb={[{ title: __('Marketplace') }]}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Store;
