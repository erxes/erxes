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
  }

  save(type, e) {
    const { __ } = this.context;

    const doc = this.generateDoc(e);
    const method = doc.method;

    if (!doc.title) return Alert.error(__('Write title'));
    if (!doc.fromUserId) return Alert.error(__('Choose from who'));

    if (method === 'messenger') {
      if (!doc.messenger.brandId) return Alert.error(__('Choose brand'));
      if (!doc.messenger.content) return Alert.error(__('Write content'));
      if (!doc.messenger.sentAs) return Alert.error(__('Choose sent as'));

      if (doc.messenger.rules.length === 0) return Alert.error(__('Add rule'));

      if (doc.kind !== 'visitorAuto') {
        if (!doc.messenger.kind)
          return Alert.error(__('Choose messenger type'));
      }
    }

    if (method === 'email') {
      if (!doc.email.subject) return Alert.error(__('Write subject'));
      if (!doc.email.content) return Alert.error(__('Write content'));
    }

    if (type === 'live') {
      this.props.save({ isLive: true, isDraft: false, ...doc });
    } else if (type === 'draft ') {
      this.props.save({ isLive: false, isDraft: true, ...doc });
    } else {
      this.props.save(doc);
    }
  }

  renderTitle() {
    const { __ } = this.context;
    const { kind } = this.props;
    let title = __('Visitor auto message');
    if (kind === 'auto') {
      title = __('Auto message');
    } else if (kind === 'manual') {
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
