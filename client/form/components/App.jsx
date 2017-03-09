import React, { PropTypes } from 'react';
import { Form, Launcher } from '../containers';


const propTypes = {
  isFormVisible: PropTypes.bool.isRequired,
};

function App({ isFormVisible }) {
  return (
    <div className="erxes-widget">
      { isFormVisible ? <Form /> : null }

      <Launcher />
    </div>
  );
}

App.propTypes = propTypes;

export default App;
