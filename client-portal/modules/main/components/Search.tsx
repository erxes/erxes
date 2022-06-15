import React from "react";
import Router from "next/router";
import { SearchContainer } from "../../styles/main";
import Icon from "../../common/Icon";

type Props = {
  searchValue?: any;
};

type State = {
  searchValue: string;
  focused: boolean;
};

export default class Search extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { searchValue } = props;

    this.state = {
      searchValue: searchValue || "",
      focused: false,
    };
  }

  componentWillReceiveProps(props) {
    const { searchValue } = props;

    this.setState({
      searchValue: searchValue || "",
    });
  }

  onChange = (e) => {
    const value = e.target.value;

    this.setState({
      searchValue: value,
    });
  };

  onSearch = () => {
    const { searchValue } = this.state;

    Router.push({
      query: { searchValue },
    });
  };

  onKeyDown = (e) => {
    const { searchValue } = this.state;

    if (e.key === "Enter") {
      Router.push({
        query: { searchValue },
      });
    }
  };

  clearSearch = () => {
    this.setState({
      searchValue: "",
    });

    Router.push({
      query: { searchValue: "" },
    });
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  onBlur = () => {
    this.setState({ focused: false });
  };

  render() {
    const { searchValue, focused } = this.state;

    return (
      <SearchContainer focused={focused}>
        <Icon icon="search" onClick={this.onSearch} color="black" />
        <input
          onChange={this.onChange}
          placeholder="Search for articles..."
          value={searchValue}
          onKeyDown={this.onKeyDown}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
        />
        {searchValue && (
          <Icon
            icon="times-circle"
            className="clear-icon"
            onClick={this.clearSearch}
          />
        )}
      </SearchContainer>
    );
  }
}
