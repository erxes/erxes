import React, { Component } from 'react';

class KbGroup extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return <form className="margined" onSubmit={this.handleSubmit} />;
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      title: document.getElementById('title').value,
      brandId: document.getElementById('selectBrand').value,
    });
  }
}

export default KbGroup;
