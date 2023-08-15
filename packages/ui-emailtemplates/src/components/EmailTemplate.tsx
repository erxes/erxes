import React from 'react';
import {
  Template,
  TemplateBox,
  Actions,
  TemplateInfo,
  IframePreview,
  IframeFullScreen
} from '../styles';
import { Icon, ModalTrigger } from '@erxes/ui/src';
import dayjs from 'dayjs';

type Props = {
  handleSelect?: (_id: string) => void;
  template: any;
  templateId: string;
  selectedTemplateId?: string;
  onlyPreview?: boolean;
};

class EmailTemplate extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderDate(createdAt, modifiedAt) {
    if (createdAt === modifiedAt) {
      if (createdAt === null) return '-';

      return dayjs(createdAt).format('DD MMM YYYY');
    }

    return dayjs(modifiedAt).format('DD MMM YYYY');
  }

  renderView(content) {
    const trigger = (
      <div>
        <Icon icon="eye" /> View
      </div>
    );
    const form = () => {
      return (
        <IframeFullScreen>
          <iframe title="content-iframe" srcDoc={content} />
        </IframeFullScreen>
      );
    };

    return (
      <ModalTrigger
        content={form}
        trigger={trigger}
        hideHeader
        title=""
        size="lg"
      />
    );
  }

  renderActions() {
    const {
      template: { content },
      handleSelect,
      templateId,
      onlyPreview
    } = this.props;

    return (
      <Actions>
        {this.renderView(content)}
        {!onlyPreview && (
          <div onClick={handleSelect && handleSelect.bind(this, templateId)}>
            <Icon icon="clicker" /> Select
          </div>
        )}
      </Actions>
    );
  }

  render() {
    const { selectedTemplateId, template } = this.props;
    const { _id, name, createdAt, modifiedAt, createdUser, content } = template;

    return (
      <Template
        key={_id}
        className={selectedTemplateId === _id ? 'active' : ''}
      >
        <h5>{name}</h5>
        <TemplateBox>
          {this.renderActions()}
          <IframePreview>
            <iframe title="content-iframe" srcDoc={content} />
          </IframePreview>
        </TemplateBox>
        <TemplateInfo>
          <p>{createdAt === modifiedAt ? `Created at` : `Modified at`}</p>
          <p>{this.renderDate(createdAt, modifiedAt)}</p>
        </TemplateInfo>
        <TemplateInfo>
          <p>Created by</p>
          {createdUser ? (
            createdUser.details.fullName && (
              <p>{createdUser.details.fullName}</p>
            )
          ) : (
            <p>erxes Inc</p>
          )}
        </TemplateInfo>
      </Template>
    );
  }
}
export default EmailTemplate;
