import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  category: PropTypes.object,
  searchString: PropTypes.string,
  onSearch: PropTypes.func,
  color: PropTypes.string,
};

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.handleSearchInput = this.handleSearchInput.bind(this);
  }

  handleSearchInput(event) {
    event.preventDefault();

    const { onSearch } = this.props;

    onSearch(event.target.value);
  }

  render() {
    const { searchString = ' ', color } = this.props;

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

SearchBar.propTypes = propTypes;
