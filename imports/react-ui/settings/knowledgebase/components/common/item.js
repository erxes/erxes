import React, { PropTypes } from 'react';

const propTypes = {
  save: PropTypes.func.isRequired,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class CommonItem extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();
  }
}

CommonItem.propTypes = propTypes;
CommonItem.contextTypes = contextTypes;

export default CommonItem;
