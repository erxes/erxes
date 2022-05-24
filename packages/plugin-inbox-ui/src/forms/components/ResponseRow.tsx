import TextInfo from '@erxes/ui/src/components/TextInfo';
import { IFormResponse } from '@erxes/ui-forms/src/forms/types';
import React from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { RowTitle } from '@erxes/ui-engage/src/styles';

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
              <RowTitle>
                <Link
                  to={`/inbox/index?_id=${formSubmission.contentTypeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {e.value || '-'}
                </Link>
              </RowTitle>
            </td>
          );
        })}
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>
            {dayjs(formSubmission.createdAt).format('YYYY MMM D, h:mm A')}
          </DateWrapper>
        </td>
      </tr>
    );
  }
}

export default ResponseRow;
