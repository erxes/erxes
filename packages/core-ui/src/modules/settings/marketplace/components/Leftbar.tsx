import React from 'react';

import Icon from 'modules/common/components/Icon';
import Button from 'modules/common/components/Button';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';

import { FlexContent } from '@erxes/ui/src/activityLogs/styles';

import CollapseFilter from './CollapseFilter';
import FormControl from './FormControl';

import {
  MainContainer,
  SearchContainer,
  Search,
  FilterContainer,
  Filter,
  FilterHeader,
  Box,
  PaddingLeft,
  PaddingBottom
} from '../styles';

type Props = {
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results?;
  loading?: boolean;
};

class Leftbar extends React.Component<
  Props,
  { showInput: boolean; searchValue: string }
> {
  constructor(props) {
    super(props);

    this.state = { showInput: true, searchValue: '' };
  }

  openInput = () => {
    this.setState({ showInput: true });
  };

  closeInput = e => {
    e.stopPropagation();
    this.setState({ showInput: false, searchValue: '' });
    // this.props.clearSearch();
  };

  handleInput = e => {
    this.setState({ searchValue: e.target.value });
  };

  renderSearch = () => {
    const { onSearch } = this.props;
    const { showInput, searchValue } = this.state;

    return (
      <>
        {showInput ? (
          <Search>
            <input
              placeholder={__('Search results')}
              value={searchValue}
              autoFocus={true}
              onKeyDown={onSearch}
              onChange={this.handleInput}
            />
            <Button size="small">Search</Button>
          </Search>
        ) : (
          <Box onClick={this.openInput}>
            <Icon icon="search-1" size={20} />
          </Box>
        )}
      </>
    );
  };

  renderCheckbox(text: string, checked?: boolean) {
    return (
      <PaddingBottom>
        <FormControl
          componentClass="checkbox"
          onChange={() => {}}
          color={colors.colorPrimary}
          defaultChecked={checked}
        >
          {text}
        </FormControl>
      </PaddingBottom>
    );
  }

  renderFilter = () => {
    const { showInput } = this.state;

    return (
      <>
        {showInput ? (
          <Filter>
            <FilterHeader>
              <FlexContent>
                <Icon icon="list-ul" size={20} />
                <PaddingLeft>Filter</PaddingLeft>
              </FlexContent>
              <Button btnStyle="simple" size="small" onClick={this.closeInput}>
                <Icon
                  style={{ cursor: 'pointer' }}
                  icon="arrow-up-left"
                  size={15}
                  color={colors.colorPrimary}
                />
              </Button>
            </FilterHeader>
            <CollapseFilter title="License" open hasBorder={true}>
              {this.renderCheckbox('All', true)}
              {this.renderCheckbox('Free')}
              {this.renderCheckbox('Premium')}
            </CollapseFilter>
            <CollapseFilter title="Categories" open hasBorder={true}>
              {this.renderCheckbox('Marketing', true)}
              {this.renderCheckbox('Sales')}
              {this.renderCheckbox('Services')}
              {this.renderCheckbox('Operations')}
              {this.renderCheckbox('Communications')}
              {this.renderCheckbox('Productivity')}
              {this.renderCheckbox('Website')}
              {this.renderCheckbox('ECommerce')}
              {this.renderCheckbox('Document management')}
              {this.renderCheckbox('Human resource')}
              {this.renderCheckbox('Finance')}
              {this.renderCheckbox('Inventory')}
              {this.renderCheckbox('Analytics')}
              {this.renderCheckbox('Reporting')}
            </CollapseFilter>
          </Filter>
        ) : (
          <Box onClick={this.openInput}>
            <Icon icon="list-ul" size={20} />
          </Box>
        )}
      </>
    );
  };

  render() {
    return (
      <MainContainer>
        <SearchContainer active={this.state.showInput}>
          {this.renderSearch()}
        </SearchContainer>
        <FilterContainer active={this.state.showInput}>
          {this.renderFilter()}
        </FilterContainer>
      </MainContainer>
    );
  }
}

export default Leftbar;
