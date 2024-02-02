import React from 'react';

import { ControlLabel } from '@erxes/ui/src';

import EmailTemplate from './EmailTemplate';
import { TemplateWrapper } from '../styles';

type Props = {
  templates: any[];
  totalCount: number;
  handleSelect: (id: string) => void;
  selectedTemplateId?: string;
};

const SelectEmailTemplate = (props: Props) => {
  const { templates, totalCount, handleSelect } = props;

  return (
    <>
      <ControlLabel>{`Total:${totalCount}`}</ControlLabel>
      <TemplateWrapper>
        {templates.map((template) => (
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
};

export default SelectEmailTemplate;
