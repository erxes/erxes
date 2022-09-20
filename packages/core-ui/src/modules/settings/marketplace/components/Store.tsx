import { CATEGORIES, STATUS_TYPES } from '../constants';
import {
  Container,
  EmptyContent,
  FilterContainer,
  FlexWrapContainer,
  Labels,
  StoreBlock,
  Tag
} from './styles';

import EmptyState from 'modules/common/components/EmptyState';
import { FlexRow } from '@erxes/ui/src/components/filterableList/styles';
import { FormControl } from 'modules/common/components/form';
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
};

class Store extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      plugins: props.plugins || [],
      status: 'All',
      searchValue: ''
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { searchValue } = this.state;

    if (prevState.searchValue !== searchValue) {
      this.setState({
        plugins: this.props.plugins.filter(
          plugin => plugin.title.toLowerCase().indexOf(searchValue) !== -1
        )
      });
    }
  }

  onSearch = e => {
    this.setState({ searchValue: e.target.value.toLowerCase() });
  };

  handleCategory = (status: string) => {
    this.setState({ status });
  };

  renderPlugins(hasAddon?: boolean) {
    const { plugins } = this.state;
    const isAddon = hasAddon ? true : false;

    if (!plugins || plugins.length === 0) {
      return (
        <EmptyContent>
          <EmptyState
            text={__(
              `Sorry, We don't have any suitable ${
                isAddon ? 'add-ons' : 'plugins'
              } at the moment`
            )}
            image={`/images/actions/${isAddon ? 5 : 30}.svg`}
          />
        </EmptyContent>
      );
    }

    return plugins.map((plugin, index) => {
      if ((isAddon ? !plugin.isAddon : plugin.isAddon) || plugin.isService) {
        return null;
      }

      return <PluginBox key={index} plugin={plugin} isAddon={isAddon} />;
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

    return plugins.map((service, index) => (
      <ServiceBox key={index} service={service} />
    ));
  }

  renderContent() {
    const { plugins = [] } = this.state;
    console.log(plugins);
    return (
      <Container>
        <FlexRow>
          <FilterContainer width={300}>
            <Tag>{__('Status')}</Tag>
            {STATUS_TYPES.map(status => (
              <FormControl
                key={status.value}
                componentClass="radio"
                onChange={() => {
                  this.handleCategory(status.value);
                }}
                checked={status.value === this.state.status}
              >
                {status.value}
              </FormControl>
            ))}
          </FilterContainer>
          <FilterContainer>
            <input
              placeholder={__('Type to search for an results') + '...'}
              type="text"
              onChange={this.onSearch}
            />
          </FilterContainer>
        </FlexRow>

        <FilterContainer>
          <Labels>
            {CATEGORIES.map((cat, index) => (
              <Tag key={index}>{cat.value}</Tag>
            ))}
          </Labels>
        </FilterContainer>

        <StoreBlock>
          <h4>{__('Services')}</h4>
          <p>
            {__(
              'Upgrade your plan with these premium services for expert help and guidance'
            )}
          </p>
          <FlexWrapContainer>{this.renderServices()}</FlexWrapContainer>
        </StoreBlock>

        <StoreBlock>
          <h4>{__('Plugins')}</h4>
          <p>{__('Customize and enhance your plugins limits')}</p>
          <FlexWrapContainer>{this.renderPlugins()}</FlexWrapContainer>
        </StoreBlock>

        <StoreBlock>
          <h4>{__('Add-ons')}</h4>
          <p>
            {__(
              'Increase the limits of individual plug-ins depending on your use'
            )}
          </p>
          <FlexWrapContainer>{this.renderPlugins(true)}</FlexWrapContainer>
        </StoreBlock>
      </Container>
    );
  }

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Store')}
            breadcrumb={[{ title: __('Store') }]}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Store;
