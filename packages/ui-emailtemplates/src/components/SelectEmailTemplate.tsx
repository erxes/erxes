import React from 'react';
import {
  BarItems,
  Button,
  Chip,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  SelectTeamMembers,
  Spinner,
  __,
  colors,
  withProps
} from '@erxes/ui/src';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';
import { QueryResponse } from '@erxes/ui/src/types';
import {
  Template,
  TemplateWrapper,
  IframePreview,
  IframeFullScreen
} from '../styles';
import {
  Actions,
  TemplateBox,
  TemplateInfo
} from '@erxes/ui-emailtemplates/src/styles';

import dayjs from 'dayjs';
import { Column } from '@erxes/ui/src/styles/main';

type EmailTemplatesProps = {
  templates: any[];
  totalCount: number;
  handleSelect: (id: string) => void;
  templateId?: string;
};

class EmailTemplates extends React.Component<EmailTemplatesProps> {
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

  renderTemplate({ _id, name, createdAt, modifiedAt, createdUser, content }) {
    const { templateId } = this.props;
    return (
      <Template key={_id} className={templateId === _id ? 'active' : ''}>
        <h5>{name}</h5>
        <TemplateBox>
          <Actions>
            {this.renderView(content)}
            <div onClick={this.props.handleSelect.bind(this, _id)}>
              <Icon icon="clicker" /> Select
            </div>
          </Actions>
          <IframePreview
          //   pointerEvent="none" width="200%"
          >
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

  render() {
    const { templates, totalCount } = this.props;

    return (
      <>
        <ControlLabel>{`Total:${totalCount}`}</ControlLabel>
        <TemplateWrapper>
          {templates.map(template => this.renderTemplate(template))}
        </TemplateWrapper>
      </>
    );
  }
}

export default EmailTemplates;
