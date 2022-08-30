import {
  Box,
  FilterContainer,
  FilterHeader,
  MainContainer,
  PaddingBottom,
  PaddingLeft,
  Search,
  SearchContainer
} from '../styles';

import Button from 'modules/common/components/Button';
import Tip from 'modules/common/components/Tip';
import CollapseFilter from './CollapseFilter';
import FormControl from './FormControl';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import { __ } from 'modules/common/utils';
import { colors } from 'modules/common/styles';
import styled from 'styled-components';

const FlexContent = styled.div`
  display: flex;
  align-items: center;
`;

type Props = {
  onSearch: (e) => void;
  onFilter: (cat) => void;
  loading?: boolean;
};

type State = {
  showInput: boolean;
  category: string;
  searchValue: string;
};

class Leftbar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { showInput: true, category: 'All', searchValue: '' };
  }

  openInput = () => {
    this.setState({ showInput: true });
  };

  closeInput = () => {
    this.setState({ showInput: false });
  };

  handleInput = e => {
    this.setState({ searchValue: e.target.value });
  };

  handleCategory = (cat: string) => {
    this.setState({ category: cat });
    this.props.onFilter(cat === 'All' ? '' : cat);
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
              onKeyUp={onSearch}
              onChange={this.handleInput}
            />
          </Search>
        ) : (
          <Box onClick={this.openInput}>
            <Icon icon="search-1" size={20} />
          </Box>
        )}
      </>
    );
  };

  renderCheckbox(text: string) {
    return (
      <PaddingBottom>
        <FormControl
          componentClass="checkbox"
          onChange={() => {
            this.handleCategory(text);
          }}
          color={colors.colorPrimary}
          checked={text === this.state.category}
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
          <>
            <FilterHeader>
              <FlexContent>
                <Icon icon="list-ul" size={20} />
                <PaddingLeft>Filter</PaddingLeft>
              </FlexContent>
              <Tip text="Shrink" placement="left">
                <Button
                  btnStyle="simple"
                  size="small"
                  onClick={this.closeInput}
                >
                  <Icon
                    style={{ cursor: 'pointer' }}
                    icon="merge"
                    size={15}
                    color={colors.colorPrimary}
                  />
                </Button>
              </Tip>
            </FilterHeader>
            <CollapseFilter title="License" open hasBorder={true}>
              {this.renderCheckbox('All')}
              {this.renderCheckbox('Free')}
              {this.renderCheckbox('Premium')}
            </CollapseFilter>
            <CollapseFilter title="Categories" open hasBorder={true}>
              {this.renderCheckbox('Marketing')}
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
          </>
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
      <MainContainer active={this.state.showInput}>
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
