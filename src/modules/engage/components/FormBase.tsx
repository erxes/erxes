import { __, Alert } from 'modules/common/utils';
import React, { Component, Fragment } from 'react';

type Props = {
  save: (params: { isLive: boolean, isDraft: boolean, doc: any }) => void,
  kind?: string,
  content: (params: {
    renderTitle: () => void,
    changeState: (name: string, value: string) => void,
    validateAndSaveForm: (type: string, doc: any) => void,
   }) => any
};

class FormBase extends Component<Props> {
  constructor(props) {
    super(props);

    this.changeState = this.changeState.bind(this);
  }

  validateAndSaveForm(type, doc) {
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

    if (doc.scheduleDate) {
      const { time, type, day, month } = doc.scheduleDate;

      if (!type && time) {
        return Alert.error(__('Choose schedule type'));
      }

      if (type && (!time || time.length === 0)) {
        return Alert.error(__('Choose schedule time'));
      }

      if ((type === 'year' || type === 'month') && !day) {
        return Alert.error(__('Choose schedule day'));
      }

      if (type === 'year' && !month) {
        return Alert.error(__('Choose schedule month'));
      }
    }

    if (type === 'live') {
      return this.props.save({ isLive: true, isDraft: false, ...doc });
    }

    if (type === 'draft ') {
      return this.props.save({ isLive: false, isDraft: true, ...doc });
    }

    this.props.save(doc);
  }

  changeState(key: string, value: string) {
    this.setState({ [key]: value });
  }

  renderTitle() {
    const { kind } = this.props;

    let title = __('Engage');

    if (kind === 'auto') {
      title = __('Auto message');
    }

    if (kind === 'manual') {
      title = __('Manual message');
    }

    if (kind === 'visitorAuto') {
      title = __('Visitor auto message');
    }

    return [{ title: __('Engage'), link: '/engage' }, { title }];
  }
  
  render() {
    return (
      <Fragment>
        {this.props.content({
          renderTitle: () => this.renderTitle(),
          changeState: this.changeState,
          validateAndSaveForm: this.validateAndSaveForm
        })}
      </Fragment>
    )
  }
}

export default FormBase;
