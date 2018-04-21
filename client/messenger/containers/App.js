import React from 'react';
import { connect } from 'react-redux';
import { connection } from '../connection';
import { saveBrowserInfo } from '../actions/messenger';
import { App as DumbApp } from '../components';

class App extends React.Component {
  componentDidMount() {
    // call save browser info mutation
    saveBrowserInfo();
  }

  render() {
    return <DumbApp {...this.props}/>
  }
}

const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
  uiOptions: connection.data.uiOptions || {}
});

export default connect(mapStateToProps)(App);
