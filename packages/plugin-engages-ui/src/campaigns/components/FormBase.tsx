import { IBreadCrumbItem } from '@erxes/ui/src/types';
import { __, Alert } from 'coreui/utils';
import React from 'react';
import { MESSAGE_KINDS, METHODS } from '@erxes/ui-engage/src/constants';
import { IEngageMessageDoc } from '@erxes/ui-engage/src/types';

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
    if (this.props.kind !== MESSAGE_KINDS.VISITOR_AUTO) {
      const { brandIds = [], customerTagIds = [], segmentIds = [] } = doc;

      if (
        !(
          brandIds.length > 0 ||
          customerTagIds.length > 0 ||
          segmentIds.length > 0
        )
      ) {
        return this.sendError(
          __('At least one brand or tag or segment must be chosen')
        );
      }
    }

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

    if (docType === 'live') {
      return {
        status: 'ok',
        doc: { isLive: true, isDraft: false, ...doc },
      };
    }

    if (docType === 'draft') {
      return {
        status: 'ok',
        doc: { isLive: false, isDraft: true, ...doc },
      };
    }

    return { status: 'ok', doc };
  };

  renderTitle() {
    let title = __('New broadcast');

    return title;
  }

  render() {
    const breadcrumbs = [
      { title: __('Broadcast'), link: '/campaigns' },
      { title: this.renderTitle() },
    ];

    return (
      <React.Fragment>
        {this.props.content({
          renderTitle: () => this.renderTitle(),
          breadcrumbs,
          validateDoc: this.validateDoc,
        })}
      </React.Fragment>
    );
  }
}

export default FormBase;
