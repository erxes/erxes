import Icon from "modules/common/components/Icon";
import Button from "./Button";
import { colors, dimensions } from "modules/common/styles";
import { __ } from "modules/common/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import CollapseFilter from "./CollapseFilter";
import FormControl from "@erxes/ui/src/components/form/Control";

const MainContainer = styledTS<{ active?: boolean }>(styled.div)`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: ${dimensions.coreSpacing}px;
  justify-content: space-between;
`;

/*
  padding: 0 ${(props) =>
    props.active ? dimensions.unitSpacing : 0};
*/

const SearchContainer = styledTS<{ active?: boolean }>(styled.div)`
  border-radius: 8px;
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

    &:focus {
      outline: 0;
    }
  }
`;

const FilterContainer = styledTS<{ active?: boolean }>(styled.div)`
  position: relative;
  height: 100%;
  transition: .3s all;
`;

const Filter = styled.div`
  border-radius: 8px;
  height: 100%;
  border: 1px solid ${colors.borderPrimary};
`;

const Box = styled.div`
  border-radius: 8px;
  background: ${colors.colorWhite};
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid ${colors.borderPrimary};
`;

const FilterHeader = styled.div`
  display: flex;
  height: 40px;
  justify-content: space-between;
  padding: 9px;
  align-items: center;
`;

const Width = styled.div`
  width: 70%;
`;

const PaddingTop = styled.div`
  padding-bottom: 5px;
`;

type Props = {
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results;
  loading?: boolean;
};

class Leftbar extends React.Component<
  Props,
  { showInput: boolean; searchValue: string }
> {
  // private wrapperRef;

  constructor(props) {
    super(props);

    this.state = { showInput: true, searchValue: "" };
  }

  openInput = () => {
    this.setState({ showInput: true });
  };

  closeInput = (e) => {
    e.stopPropagation();
    this.setState({ showInput: false, searchValue: "" });
    // this.props.clearSearch();
  };

  handleInput = (e) => {
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
              placeholder={__("Search results")}
              value={searchValue}
              autoFocus={true}
              onKeyDown={onSearch}
              onChange={this.handleInput}
            />
            <Button size="small">Search</Button>
          </Search>
        ) : (
          <Box>
            <Icon icon="search-1" size={20} />
          </Box>
        )}
      </>
    );
  };

  renderCheckbox(text: string) {
    // const { isInternal } = this.state;

    // if (kind.includes('nylas') || kind === 'gmail') {
    //   return null;
    // }

    return (
      <PaddingTop>
        <FormControl
          componentClass="checkbox"
          onChange={() => {}}
          color={colors.colorPrimary}
        >
          {text}
        </FormControl>
      </PaddingTop>
    );
  }

  renderFilter = () => {
    const { showInput } = this.state;

    return (
      <>
        {showInput ? (
          <Filter>
            <FilterHeader>
              <Icon icon="list-ul" size={20} />
              <Width>
                <b>Filter</b>
              </Width>
              <Button btnStyle="simple" size="small" onClick={this.closeInput}>
                <Icon
                  style={{ cursor: "pointer" }}
                  icon="arrow-up-left"
                  size={15}
                  color={colors.colorPrimary}
                />
              </Button>
            </FilterHeader>
            <CollapseFilter compact title="License" open hasBorder={true}>
              {this.renderCheckbox("All")}
              {this.renderCheckbox("Free")}
              {this.renderCheckbox("Premium")}
            </CollapseFilter>
            <CollapseFilter compact title="Categories" open hasBorder={true}>
              {this.renderCheckbox("All")}
              {this.renderCheckbox("Templates")}
              {this.renderCheckbox("Plugins")}
              {this.renderCheckbox("Add-Ons")}
            </CollapseFilter>
            <CollapseFilter compact title="Products" open hasBorder={true}>
              {this.renderCheckbox("All")}
              {this.renderCheckbox("Employee XM")}
              {this.renderCheckbox("Customer XM")}
              {this.renderCheckbox("Product XM")}
              {this.renderCheckbox("Core XM")}
              {this.renderCheckbox("Brand XM")}
            </CollapseFilter>
          </Filter>
        ) : (
          <Box>
            <Icon icon="list-ul" size={20} />
          </Box>
        )}
      </>
    );
  };

  render() {
    return (
      <MainContainer
        // innerRef={this.setWrapperRef}
        active={this.state.showInput}
        // onClick={this.openInput}
      >
        <SearchContainer active={this.state.showInput} onClick={this.openInput}>
          {this.renderSearch()}
        </SearchContainer>
        <FilterContainer active={this.state.showInput} onClick={this.openInput}>
          {this.renderFilter()}
        </FilterContainer>
      </MainContainer>
    );
  }
}

export default Leftbar;
