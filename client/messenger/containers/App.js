import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connection } from '../connection';
import { saveBrowserInfo } from '../actions/messenger';
import { App as DumbApp } from '../components';

class App extends React.Component {
  componentDidMount() {
    // call save browser info mutation
    this.props.saveBrowserInfo();
  }

  render() {
    return <DumbApp {...this.props}/>
  }
}

const mapDisptachToProps = dispatch => ({
  saveBrowserInfo() {
    dispatch(saveBrowserInfo());
  },
});

const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
  uiOptions: connection.data.uiOptions || {}
});

App.propTypes = {
  saveBrowserInfo: PropTypes.func,
}

export default connect(mapStateToProps, mapDisptachToProps)(App);
