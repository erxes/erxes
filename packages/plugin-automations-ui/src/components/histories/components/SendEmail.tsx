import React from 'react';
import EmailTemplate from '@erxes/ui-emailtemplates/src/components/EmailTemplate';
import {
  Button,
  ControlLabel,
  FormGroup,
  Label,
  ModalTrigger,
  Tip,
  __
} from '@erxes/ui/src';
import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column } from '@erxes/ui/src/styles/main';
import { LabelContainer } from '../styles';

type Props = {
  result: any;
  action: any;
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
          <LabelContainer>
            <strong>{`To:`}</strong>
            {responses.map((response, i) => (
              <>
                <Tip text={getLabelText(response)}>
                  <Label key={i} lblStyle={getLabelColor(response)}>
                    {response?.toEmail || ''}
                  </Label>
                </Tip>
              </>
            ))}
          </LabelContainer>
        </ul>
      </li>
    );
  }

  render() {
    const { action, result } = this.props;
    return (
      <div>
        {this.renderTemplate(action, result)}
        <div>{this.renderEmails(result)}</div>
      </div>
    );
  }
}

export default SendEmail;
