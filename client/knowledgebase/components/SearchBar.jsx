import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  category: PropTypes.object, // eslint-disable-line
  searchStr: PropTypes.string,
  onUpdateSearchString: PropTypes.func,
  color: PropTypes.string,
};

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchInput = this.handleSearchInput.bind(this);
  }

  handleSearchInput(event) {
    event.preventDefault();
    const { onUpdateSearchString } = this.props;
    onUpdateSearchString(event.target.value);
  }

  render() {
    const { searchStr = ' ', color } = this.props;
    return (
      <div className="erxes-searchbar" style={color ? { backgroundColor: color } : {}}>
        <div className="erxes-knowledge-container">
          <i className="icon-search" />
          <input value={searchStr} onChange={this.handleSearchInput} />
        </div>
      </div>
    );
  }
}

SearchBar.propTypes = propTypes;
