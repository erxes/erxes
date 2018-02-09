import { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  brands: PropTypes.array,
  users: PropTypes.array,
  save: PropTypes.func,
  kind: PropTypes.string,
  message: PropTypes.object
};

class FormBase extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(type, e) {
    const doc = this.generateDoc(e);
    if (type === 'live') {
      this.props.save({ isLive: true, isDraft: false, ...doc });
    } else if (type === 'draft ') {
      this.props.save({ isLive: false, isDraft: true, ...doc });
    } else {
      this.props.save(doc);
    }
  }

  renderTitle() {
    const { kind } = this.props;
    let title = 'Visitor auto message';
    if (kind === 'auto') {
      title = 'Auto message';
    } else if (kind === 'manual') {
      title = 'Manual message';
    }
    const breadcrumb = [{ title: 'Engage', link: '/engage' }, { title: title }];
    return breadcrumb;
  }
}

FormBase.propTypes = propTypes;

export default FormBase;
