import { CATEGORIES, OS_SERVICES, STATUS_TYPES } from '../constants';
import {
  Container,
  FilterContainer,
  FlexWrapContainer,
  Labels,
  Tag
} from './styles';

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
};

class Store extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      status: 'All'
    };
  }

  handleCategory = (status: string) => {
    this.setState({ status });
  };

  renderContent() {
    const { plugins = [] } = this.props;
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
              placeholder={__('Search results')}
              // value={searchValue}
              // autoFocus={true}
              // onKeyUp={onSearch}
              // onChange={this.handleInput}
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

        <h4>{__('Services')}</h4>
        <p>
          {__(
            'Upgrade your plan with these premium services for expert help and guidance'
          )}
        </p>
        <FlexWrapContainer>
          {OS_SERVICES.map((service, index) => (
            <ServiceBox key={index} service={service} />
          ))}
        </FlexWrapContainer>

        <h4>{__('Plugins')}</h4>
        <p>{__('Customize and enhance your plugins limits')}</p>
        <FlexWrapContainer>
          {plugins.map((plugin, index) => (
            <PluginBox key={index} plugin={plugin} />
          ))}
        </FlexWrapContainer>

        <h4>{__('Add-ons')}</h4>
        <p>
          {__(
            'Increase the limits of individual plug-ins depending on your use'
          )}
        </p>
        <PluginBox />
      </Container>
    );
  }

  render() {
    return <Wrapper content={this.renderContent()} />;
  }
}

export default Store;
