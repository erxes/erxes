import React, { useState } from 'react';

import { Button, ControlLabel, colors } from '@erxes/ui/src';

import EmailTemplate from './EmailTemplate';
import { TemplateWrapper } from '../styles';
import { FlexRow } from '@erxes/ui-settings/src/styles';

type Props = {
  templates: any[];
  totalCount: number;
  handleSelect: (id: string) => void;
  selectedTemplateId?: string;
};

const SelectEmailTemplate = (props: Props) => {
  const { templates, totalCount, handleSelect } = props;

  const [type, setType] = useState('list');

  return (
    <>
      <FlexRow $justifyContent="space-between">
        <ControlLabel>{`Total:${totalCount}`}</ControlLabel>

        <FlexRow $justifyContent="end">
          <Button
            btnStyle="link"
            icon="list-ul"
            iconColor={type === 'list' ? colors.colorPrimary : ''}
            onClick={() => setType('list')}
          />
          <Button
            btnStyle="link"
            icon="apps"
            iconColor={type === 'grid' ? colors.colorPrimary : ''}
            onClick={() => setType('grid')}
          />
        </FlexRow>
      </FlexRow>
      <TemplateWrapper $isGrid={type === 'grid'}>
        {templates.map(template => (
          <EmailTemplate
            key={template._id}
            template={template}
            templateId={template._id}
            width={type === 'grid' ? '200px' : ''}
            handleSelect={handleSelect}
          />
        ))}
      </TemplateWrapper>
    </>
  );
};

export default SelectEmailTemplate;
