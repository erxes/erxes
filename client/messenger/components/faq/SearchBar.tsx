import * as React from "react";
import { iconSearch } from "../../../icons/Icons";
import { __ } from "../../../utils";

type Props = {
  searchString: string;
  onSearch: (value: string) => void;
};

export default class SearchBar extends React.PureComponent<Props> {
  handleSearchInput = (event: React.FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    this.props.onSearch(event.currentTarget.value);
  };

  render() {
    const { searchString = "" } = this.props;
    const placeholder = __("Search");

    return (
      <div className="erxes-faq-searchbar">
        {iconSearch}
        <input
          className="form-control"
          placeholder={placeholder ? placeholder.toString() : ""}
          value={searchString}
          onChange={this.handleSearchInput}
        />
      </div>
    );
  }
}
