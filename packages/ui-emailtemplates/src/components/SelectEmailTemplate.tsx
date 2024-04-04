import React from 'react';
import { ControlLabel } from '@erxes/ui/src';
import { TemplateWrapper } from '../styles';
import EmailTemplate from './EmailTemplate';

type EmailTemplatesProps = {
  templates: any[];
  totalCount: number;
  handleSelect: (id: string) => void;
  selectedTemplateId?: string;
};

class EmailTemplates extends React.Component<EmailTemplatesProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { templates, totalCount, handleSelect } = this.props;

    return (
      <>
        <ControlLabel>{`Total:${totalCount}`}</ControlLabel>
        <TemplateWrapper>
          {templates.map(template => (
            <EmailTemplate
              key={template._id}
              template={template}
              templateId={template._id}
              handleSelect={handleSelect}
            />
          ))}
        </TemplateWrapper>
      </>
    );
  }
}

export default EmailTemplates;
