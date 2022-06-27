import Icon from 'modules/common/components/Icon';
import Button from 'modules/common/components/Button';
import { colors, dimensions } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import CollapseFilter from './CollapseFilter';
import FormControl from './FormControl';
import { FlexContent } from '@erxes/ui/src/activityLogs/styles';
import Sidebar from 'modules/layout/components/Sidebar';

const MainContainer = styledTS<{ active?: boolean }>(styled.section)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styledTS<{ active?: boolean }>(styled.div)`
  position: relative;
  transition: .3s all;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const Search = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  padding: 6px;

  input {
    background: 0 0;
    border: none;
    flex: 1;
    outline: 0;
  }
`;

const FilterContainer = styledTS<{ active?: boolean }>(styled.div)`
  transition: .s all;
  flex: 1;
`;

const Filter = styled.div`
  border-radius: 8px;
  height: 100%;
  border: 1px solid ${colors.borderPrimary};
`;

const FilterHeader = styled.div`
  display: flex;
  height: 40px;
  justify-content: space-between;
  padding: 9px;
  align-items: center;
`;

const Box = styled.div`
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid ${colors.borderPrimary};
`;

const PaddingLeft = styled.div`
  padding-left: ${dimensions.unitSpacing}px;
  font-weight: 700;
`;

const PaddingBottom = styled.div`
  padding-bottom: 5px;
`;

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
  // private wrapperRef;

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
