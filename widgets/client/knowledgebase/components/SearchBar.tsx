import * as React from "react";

type Props = {
  searchString: string;
  color: string;
  onSearch: (value: string) => void;
};

export default class SearchBar extends React.Component<Props> {
  handleSearchInput = (event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();

    const { onSearch } = this.props;

    onSearch(event.currentTarget.value);
  };

  render() {
    const { searchString = " ", color } = this.props;

    return (
      <div className="erxes-searchbar" style={{ backgroundColor: color }}>
        <div className="erxes-knowledge-container">
          <i className="icon-search" />
          <input value={searchString} onChange={this.handleSearchInput} />
        </div>
      </div>
    );
  }
}
