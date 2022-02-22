import TextInfo from 'modules/common/components/TextInfo';
import { IFormResponse } from 'modules/forms/types';
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
