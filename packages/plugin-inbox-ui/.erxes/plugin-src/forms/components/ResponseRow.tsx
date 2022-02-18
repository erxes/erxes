// import dayjs from 'dayjs';
// import FormControl from '@erxes/ui/src/components/form/Control';
// import Icon from '@erxes/ui/src/components/Icon';
// import Label from '@erxes/ui/src/components/Label';
// import Tags from '@erxes/ui/src/components/Tags';
import TextInfo from '@erxes/ui/src/components/TextInfo';
// import { DateWrapper } from '@erxes/ui/src/styles/main';

import { IFormResponse } from '@erxes/ui-forms/src/forms/types';

import React from 'react';

type Props = {
  formSubmission: IFormResponse;
  fieldIds: string[];
};

class ResponseRow extends React.Component<Props> {
  render() {
    const { formSubmission, fieldIds } = this.props;
    const submissions = formSubmission.submissions || [];

    const result: Array<{ formFieldId: string; value: any }> = [];

    for (const id of fieldIds) {
      const foundIndex = submissions.findIndex(e => e.formFieldId === id);
      if (foundIndex === -1) {
        result.push({ formFieldId: id, value: '-' });
      } else {
        result.push(submissions[foundIndex]);
      }
    }

    return (
      <tr>
        {result.map(e => {
          return (
            <td key={e.formFieldId}>
              <TextInfo ignoreTrans={true}>{e.value || '-'}</TextInfo>
            </td>
          );
        })}
      </tr>
    );
  }
}

export default ResponseRow;
