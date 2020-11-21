import { IBreadCrumbItem } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import React from 'react';
import { METHODS } from '../constants';
import { IEngageMessageDoc } from '../types';

type Props = {
  kind: string;
  content: (params: {
    renderTitle: () => string;
    breadcrumbs: IBreadCrumbItem[];
    validateDoc: (
      type: string,
      doc: IEngageMessageDoc
    ) => { status: string; doc?: IEngageMessageDoc };
  }) => any;
};

class FormBase extends React.Component<Props> {
  sendError(message: string): { status: string } {
    Alert.error(message);

    return { status: 'error' };
  }

  validateDoc = (docType, doc): { status: string; doc?: IEngageMessageDoc } => {
    if (!doc.title) {
      return this.sendError(__('Write a title'));
    }

    if (!doc.fromUserId && doc.method !== METHODS.SMS) {
      return this.sendError(__('Choose a sender'));
    }

    if (doc.messenger) {
      const { brandId, sentAs, content } = doc.messenger;

      if (!brandId) {
        return this.sendError(__('Choose a brand'));
      }

      if (!sentAs) {
        return this.sendError(__('Choose a sent as'));
      }

      if (!content) {
        return this.sendError(__('Write a content'));
      }
    }

    if (doc.email) {
      const { subject, content } = doc.email;

      if (!subject) {
        return this.sendError(__('Write an email subject'));
      }

      if (!content) {
        return this.sendError(__('Write a content'));
      }
    }

    if (doc.scheduleDate) {
      const { type, day, month } = doc.scheduleDate;

      if (!type) {
        return this.sendError(__('Choose a schedule day'));
      }

      if ((type === 'year' || type === 'month') && !day) {
        return this.sendError(__('Choose a schedule day'));
      }

      if (type === 'year' && !month) {
        return this.sendError(__('Choose a schedule day'));
      }
    }

    if (docType === 'live') {
      return {
        status: 'ok',
        doc: { isLive: true, isDraft: false, ...doc }
      };
    }

    if (docType === 'draft') {
      return {
        status: 'ok',
        doc: { isLive: false, isDraft: true, ...doc }
      };
    }

    return { status: 'ok', doc };
  };

  renderTitle() {
    const { kind } = this.props;

    let title = __('Auto message');

    if (kind === 'manual') {
      title = __('Manual message');
    }

    if (kind === 'visitorAuto') {
      title = __('Visitor auto message');
    }

    return title;
  }

  render() {
    const breadcrumbs = [
      { title: __('Engage'), link: '/engage' },
      { title: this.renderTitle() }
    ];

    return (
      <React.Fragment>
        {this.props.content({
          renderTitle: () => this.renderTitle(),
          breadcrumbs,
          validateDoc: this.validateDoc
        })}
      </React.Fragment>
    );
  }
}

export default FormBase;
