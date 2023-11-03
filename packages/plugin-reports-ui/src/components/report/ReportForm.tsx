import { FlexRow } from '@erxes/ui-settings/src/styles';
import { FormControl } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import {
  BoxContainer,
  FlexColumn,
  FormContentWrapper,
  ReportsSearchSection,
  ReportsTemplatesSection
} from '../../styles';

type Props = {
  history: any;
  queryParams: any;
};

const templates = [
  {
    name: 'Chat overview',
    description: `Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.`
  },
  {
    name: 'Email overview',
    description: `Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.`
  },
  {
    name: 'Sales',
    description: `Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.`
  }
];
const ReportForm = (props: Props) => {
  // show report templates list
  // set visibility
  return (
    <FormContentWrapper>
      <ReportsTemplatesSection>
        <FlexColumn style={{ gap: '20px' }}>
          <BoxContainer>
            <div>
              <h5> + Create a report from scratch</h5>
            </div>
          </BoxContainer>

          <h3>Create reports from templates</h3>

          {templates.map((template, index) => (
            <BoxContainer key={index}>
              <FlexRow>
                <div></div>
                <FlexColumn>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </FlexColumn>
              </FlexRow>
            </BoxContainer>
          ))}
        </FlexColumn>
      </ReportsTemplatesSection>

      <ReportsSearchSection>
        <FormControl
          type="text"
          placeholder={__('Search report templates')}
          // onChange={search}
          // value={searchValue}
          // autoFocus={true}
          // onFocus={moveCursorAtTheEnd}
        />
      </ReportsSearchSection>
    </FormContentWrapper>
  );
};

export default ReportForm;
