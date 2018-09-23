import { IBreadCrumbItem } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import * as React from 'react';
import { IEngageMessageDoc } from '../types';

type Props = {
  kind: string;
  content: (params: {
    renderTitle: () => IBreadCrumbItem[];
    validateDoc: (type: string, doc: IEngageMessageDoc) => { status: string, doc?: IEngageMessageDoc };
  }) => any;
};

class FormBase extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.validateDoc = this.validateDoc.bind(this);
  }

  sendError(message: string): { status: string } {
    Alert.error(message);

    return { status: 'error' };
  }

  validateDoc(type, doc): { status: string, doc?: IEngageMessageDoc } {
    if (!doc.title) {
      return this.sendError(__('Write title'));
    }

    if (!doc.fromUserId) {
      return this.sendError(__('Choose from who'));
    }

    if (doc.messenger && !doc.messenger.brandId) {
      return this.sendError(__('Choose brand'));
    }

    if (doc.messenger && !doc.messenger.sentAs) {
      return this.sendError(__('Choose from sent as'));
    }

    if (doc.scheduleDate) {
      const { time, type, day, month } = doc.scheduleDate;

      if (!type && time) {
        return this.sendError(__('Choose schedule type'));
      }

      if (type && (!time || time.length === 0)) {
        return this.sendError(__('Choose schedule time'));
      }

      if ((type === 'year' || type === 'month') && !day) {
        return this.sendError(__('Choose schedule day'));
      }

      if (type === 'year' && !month) {
        return this.sendError(__('Choose schedule month'));
      }
    }

    if (type === 'live') {
      return {
        status: 'ok',
        doc: { isLive: true, isDraft: false, ...doc },
      }
    }

    if (type === 'draft ') {
      return {
        status: 'ok',
        doc: { isLive: false, isDraft: true, ...doc },
      }
    }

    return { status: 'ok', doc };
  }

  renderTitle() {
    const { kind } = this.props;

    let title = __('Auto message');

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
      <React.Fragment>
        {this.props.content({
          renderTitle: () => this.renderTitle(),
          validateDoc: this.validateDoc
        })}
      </React.Fragment>
    )
  }
}

export default FormBase;
