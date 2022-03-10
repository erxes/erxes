import Icon from "modules/common/components/Icon";
import Button from "./Button";
import { colors, dimensions } from "modules/common/styles";
import { __ } from "modules/common/utils";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import CollapseFilter from "./CollapseFilter";

const MainContainer = styledTS<{ active?: boolean }>(styled.div)`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
  justify-content: space-between;
`;

/*
  padding: 0 ${(props) =>
    props.active ? dimensions.unitSpacing : 0};
*/

const SearchContainer = styledTS<{ active?: boolean }>(styled.div)`
  border-radius: 8px;
  height: 48px;
  position: relative;
  transition: .3s all;
  display: flex;
  align-items: center;
  position: relative;

  > span {
    color: ${colors.colorCoreGray};
    padding-left: 8px;
  }
  
  i {
    cursor: pointer;
    color: ${colors.colorCoreDarkGray};
  }

  input {
    background: 0 0;
    border: none;
    padding: 8px 8px;
    flex: 1;
    height: 100%;
    outline: 0;

    &:focus {
      outline: 0;
    }
  }
`;

const Search = styled.div`
  border: 1px solid ${colors.borderDarker};
  border-radius: 8px;
  height: 100%;
  padding: 0 6px;
`;

const FilterContainer = styledTS<{ active?: boolean }>(styled.div)`
  position: relative;
  height: 92%;
  transition: .3s all;
`;

const Filter = styled.div`
  border-radius: 8px;
  height: 100%;
  border: 1px solid ${colors.borderDarker};
`;

const Box = styled.div`
  border-radius: 8px;
  background: ${colors.colorWhite};
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid ${colors.borderDarker};
`;

const FilterHeader = styled.div`
  border-bottom: 1px solid ${colors.borderDarker};
  display: flex;
  height: 48px;
  justify-content: space-between;
  padding: 12px;
  align-items: center;
`;

const Width = styled.div`
  width: 70%;
`;

// const FilterBox = styled.div`
//   border-bottom: 1px solid ${colors.borderPrimary};
// `;

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
            <Button>Search</Button>
          </Search>
        ) : (
          <Box>
            <Icon icon="search-1" size={20} />
          </Box>
        )}
      </>
    );
  };

  renderFilter = () => {
    const { showInput } = this.state;

    return (
      <>
        {showInput ? (
          <Filter>
            <FilterHeader>
              <Icon icon="list-ul" size={20} />
              <Width><b>Filter</b></Width>
              <Button btnStyle="simple" size="small">
                <Icon
                  style={{ cursor: "pointer" }}
                  onClick={this.closeInput}
                  icon="arrow-up-left"
                  size={15}
                  color= {colors.colorPrimary}
                />
              </Button>
            </FilterHeader>
            <CollapseFilter compact title="License" open hasBorder={true}>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                All
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Free
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Premium
              </div>
            </CollapseFilter>
            <CollapseFilter compact title="Categories" open hasBorder={true}>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                All
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Templates
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Plugins
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Add-Ons
              </div>
            </CollapseFilter>
            <CollapseFilter compact title="Products" open hasBorder={false}>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                All
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Employee XM
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Customer XM
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Product XM
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Core XM
              </div>
              <div className="radio">
                <input
                  type="radio"
                  // value="All"
                  // checked={this.state.selectedOption === "Male"}
                  // onChange={this.onValueChange}
                />
                Brand XM
              </div>
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
