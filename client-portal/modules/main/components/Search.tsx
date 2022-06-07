import React from "react";
import Router, { useRouter } from "next/router";
import { SearchContainer } from "../../styles/main";
import Icon from "../../common/Icon";

type Props = {};

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
    // const { history } = this.props;
    const { searchValue } = this.state;
    console.log(searchValue);
    Router.push({
      query: { searchValue },
    });

    // setParams(history, { searchValue });
  };

  onKeyDown = (e) => {
    // const { history } = this.props;
    const { searchValue } = this.state;

    if (e.key === "Enter") {
      console.log(searchValue);
      Router.push({
        query: { searchValue },
      });
    }
  };

  clearSearch = () => {
    // const { history } = this.props;

    this.setState({
      searchValue: "",
    });

    // setParams(history, { searchValue: "" });
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
        {searchValue && <Icon icon="times-circle" onClick={this.clearSearch} />}
      </SearchContainer>
    );
  }
}
