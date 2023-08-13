import React from 'react';
import EmailTemplate from '@erxes/ui-emailtemplates/src/containers/EmailTemplate';
import { QueryResponse } from '@erxes/ui/src/types';
import { ControlLabel, FormGroup, ModalTrigger, __ } from '@erxes/ui/src';

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

  renderContent() {
    const { action } = this.props;
    const { actionConfig } = action;

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Email Template')}</ControlLabel>
          <EmailTemplate templateId={actionConfig.templateId} onlyPreview />
        </FormGroup>
      </>
    );
  }

  render() {
    const trigger = <p>See Detail</p>;

    return (
      <ModalTrigger
        title=""
        size="xl"
        hideHeader
        trigger={trigger}
        content={this.renderContent}
      />
    );
  }
}

export default SendEmail;
