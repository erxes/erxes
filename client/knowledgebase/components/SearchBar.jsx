import React, { PropTypes } from 'react';

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleSearchInput = this.handleSearchInput.bind(this);
  }

  handleSearchInput(event) {
    event.preventDefault();
    console.log('handleSearchInput: ', event.target.value);
    const { onUpdateSearchString } = this.props;
    onUpdateSearchString(event.target.value);
  }

  render() {
    let { searchStr } = this.props;
    searchStr = searchStr || '';
    return (
      <div className="erxes-searchbar">
        <div className="erxes-knowledge-container">
          <input value={searchStr} onChange={this.handleSearchInput} />
        </div>
      </div>
    );
  }
}

SearchBar.propTypes = {
  category: PropTypes.object, // eslint-disable-line
  searchStr: PropTypes.string,
  onUpdateSearchString: PropTypes.func,
};
