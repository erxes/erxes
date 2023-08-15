import React from 'react';
import EmailTemplate from '@erxes/ui-emailtemplates/src/containers/EmailTemplate';
import { QueryResponse } from '@erxes/ui/src/types';
import {
  ControlLabel,
  FormGroup,
  Label,
  ModalTrigger,
  Tip,
  __
} from '@erxes/ui/src';
import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column } from '@erxes/ui/src/styles/main';

type Props = {
  result: any;
  action: any;
};

type FinalProps = {
  emailTemplateQuery: any & QueryResponse;
} & Props;

class SendEmail extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.renderContent = this.renderContent.bind(this);
  }

  renderTemplate(action) {
    const { actionConfig } = action;

    return (
      <FormGroup>
        <ControlLabel>{__('Email Template')}</ControlLabel>
        <EmailTemplate templateId={actionConfig.templateId} onlyPreview />
      </FormGroup>
    );
  }

  renderEmails({ fromEmail, title, responses }) {
    const getLabelColor = response => {
      if (response?.messageId) {
        return 'success';
      }
      if (response?.error) {
        return 'danger';
      }
      return 'default';
    };

    return (
      <li>
        <ul>
          <strong>{`From: `}</strong>
          {`${fromEmail || ''}`}
        </ul>
        <ul>
          <strong>{`Subject: `}</strong>
          {`${title || ''}`}
        </ul>
        <ul>
          <strong>{`To:`}</strong>
          {responses.map((response, i) => (
            <>
              <Tip
                text={response?.error || response.messageId ? 'Sent' : '' || ''}
              >
                <Label key={i} lblStyle={getLabelColor(response)}>
                  {response?.toEmail || ''}
                </Label>
              </Tip>
            </>
          ))}
        </ul>
      </li>
    );
  }

  renderContent() {
    const { action, result } = this.props;

    return (
      <Columns>
        {this.renderTemplate(action)}
        <Column>{this.renderEmails(result)}</Column>
      </Columns>
    );
  }

  render() {
    const trigger = <p>See Detail</p>;

    return (
      <ModalTrigger
        title=""
        size="lg"
        hideHeader
        trigger={trigger}
        content={this.renderContent}
      />
    );
  }
}

export default SendEmail;
