import React from 'react';
import EmailTemplate from '@erxes/ui-emailtemplates/src/components/EmailTemplate';
import { ControlLabel, FormGroup, Label, Tip, __ } from '@erxes/ui/src';
import { LabelContainer } from '../styles';

type Props = {
  result: any;
  action: any;
  hideTemplate?: boolean;
};

class SendEmail extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderTemplate(action, result) {
    const { actionConfig } = action;

    return (
      <FormGroup>
        <ControlLabel>{__('Email Template')}</ControlLabel>
        <EmailTemplate
          templateId={actionConfig?.templateId}
          template={{ content: result.customHtml }}
          onlyPreview
        />
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

    const getLabelText = response => {
      if (response.error) {
        return typeof response?.error === 'object'
          ? JSON.stringify(response.error || {})
          : `${response?.error}`;
      }

      if (response.messageId) {
        return 'Sent';
      }

      return '';
    };

    return (
      <ul>
        <li>
          <strong>From: </strong>
          {`${fromEmail || ''}`}
        </li>
        <li>
          <strong>Subject: </strong>
          {`${title || ''}`}
        </li>
        <li>
          <LabelContainer>
            <strong>To: </strong>
            {responses.map((response, i) => (
              <Tip key={i} text={getLabelText(response)}>
                <Label lblStyle={getLabelColor(response)}>
                  {response?.toEmail || ''}
                </Label>
              </Tip>
            ))}
          </LabelContainer>
        </li>
      </ul>
    );
  }

  render() {
    const { action, result, hideTemplate } = this.props;
    return (
      <div>
        {!hideTemplate && this.renderTemplate(action, result)}
        <div>{this.renderEmails(result)}</div>
      </div>
    );
  }
}

export default SendEmail;
