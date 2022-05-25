import React from 'react';
import { SearchContainer } from '../../styles/main';
import Icon from '../../common/Icon';
import { setParams } from '../../common/routerUtils';

type Props = {
  history: any;
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
      focused: false
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
    const { history } = this.props;
    const { searchValue } = this.state;

    setParams(history, { searchValue });
  };

  onKeyDown = (e) => {
    const { history } = this.props;
    const { searchValue } = this.state;

    if (e.key === "Enter") {
      setParams(history, { searchValue });
    }
  };

  clearSearch = () => {
    const { history } = this.props;

    this.setState({
      searchValue: "",
    });

    setParams(history, { searchValue: "" });
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
        <Icon icon="search-1" onClick={this.onSearch} />

        {searchValue && <Icon icon="times-circle" onClick={this.clearSearch} />}

        <input
          onChange={this.onChange}
          placeholder="Search for articles..."
          value={searchValue}
          onKeyDown={this.onKeyDown}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
        />
      </SearchContainer>
    );
  }
}