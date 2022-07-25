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
  onSearch: (e) => void;
  onFilter: (cat) => void;
  loading?: boolean;
};

class Leftbar extends React.Component<
  Props,
  { showInput: boolean; category: string }
> {
  constructor(props) {
    super(props);

    this.state = { showInput: true, category: 'All' };
  }

  openInput = () => {
    this.setState({ showInput: true });
  };

  closeInput = () => {
    this.setState({ showInput: false });
  };

  handleCategory = (cat: string) => {
    this.setState({ category: cat });
    this.props.onFilter(cat === 'All' ? '' : cat);
  };

  renderSearch = () => {
    const { onSearch } = this.props;
    const { showInput } = this.state;

    return (
      <>
        {showInput ? (
          <Search>
            <input
              placeholder={__('Search results')}
              autoFocus={true}
              onKeyUp={onSearch}
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
