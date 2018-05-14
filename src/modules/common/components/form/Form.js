import React from 'react';
import PropTypes from 'prop-types';
import Formsy from 'formsy-react';

const propTypes = {
  onSubmit: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

class Form extends React.Component {
  render() {
    return (
      <Formsy onValidSubmit={this.props.onSubmit}>{this.props.children}</Formsy>
    );
  }
}

Form.propTypes = propTypes;

export default Form;
