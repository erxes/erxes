import React, { PropTypes, Component } from 'react';

class ContentBuilder extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(e.target.value);
  }

  render() {
    return <textarea defaultValue={this.props.defaultValue} onChange={this.onChange} />;
  }
}

ContentBuilder.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string,
};

export default ContentBuilder;
