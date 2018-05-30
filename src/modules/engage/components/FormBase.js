import { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';

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
    this.changeState = this.changeState.bind(this);
  }

  save(type, e) {
    const { __ } = this.context;
    const doc = this.generateDoc(e);

    if (!doc.title) {
      return Alert.error(__('Write title'));
    }

    if (!doc.fromUserId) {
      return Alert.error(__('Choose from who'));
    }

    if (doc.messenger && !doc.messenger.brandId) {
      return Alert.error(__('Choose brand'));
    }

    if (doc.messenger && !doc.messenger.sentAs) {
      return Alert.error(__('Choose from sent as'));
    }

    if (type === 'live') {
      return this.props.save({ isLive: true, isDraft: false, ...doc });
    }

    if (type === 'draft ') {
      return this.props.save({ isLive: false, isDraft: true, ...doc });
    }

    this.props.save(doc);
  }

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  renderTitle() {
    const { __ } = this.context;
    const { kind } = this.props;

    let title = __('Visitor auto message');

    if (kind === 'auto') {
      title = __('Auto message');
    }

    if (kind === 'manual') {
      title = __('Manual message');
    }

    return [{ title: __('Engage'), link: '/engage' }, { title: title }];
  }
}

FormBase.propTypes = propTypes;
FormBase.contextTypes = {
  __: PropTypes.func
};

export default FormBase;
