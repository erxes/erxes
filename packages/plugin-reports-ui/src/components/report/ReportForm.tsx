import { Label } from '@erxes/ui/src/components';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { BoxContainer } from '../../styles';

type Props = {
  history: any;
  queryParams: any;
};
const ReportForm = (props: Props) => {
  // show report templates list
  // set visibility
  return (
    <FlexContent>
      <Label>Create a report from scratch</Label>
      <FlexContent>
        <BoxContainer>
          <Label>New dashboard</Label>
        </BoxContainer>
      </FlexContent>
    </FlexContent>
  );
};

export default ReportForm;
