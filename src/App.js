import React, { Component } from 'react';
import Button from './components/Button';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Button btnStyle="success">
          Welcome to erxes
        </Button>
      </div>
    );
  }
}

export default App;
