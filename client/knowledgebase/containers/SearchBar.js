import { connect } from 'react-redux';
import { SearchBar } from '../components';
import { updateSearchString } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
});

const mapDisptachToProps = dispatch => ({
  onUpdateSearchString(searchStr) {
    dispatch(updateSearchString(searchStr));
  },
});


export default connect(mapStateToProps, mapDisptachToProps)(SearchBar);
