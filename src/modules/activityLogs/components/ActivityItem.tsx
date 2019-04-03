import { ActivityContent, EmailContent } from 'modules/activityLogs/styles';
import { Icon } from 'modules/common/components';
import * as React from 'react';
import * as xss from 'xss';
import ActivityRow from './ActivityRow';

type Props = {
  data: any;
};

const ActivityItem = (props: Props) => {
  const { data } = props;
  let isInternalNote = false;

  if (data.action === 'internal_note-create') {
    isInternalNote = true;
  }

  if (data.action === 'email-send') {
    const content = JSON.parse(data.content);

    return (
      <ActivityRow
        data={data}
        body={
          <>
            <p>{content.subject}</p>
            <div>
              {data.caption}
              <Icon icon="rightarrow" /> To: <span>{content.toEmails}</span>
              {content.cc && <span>Cc: {content.cc}</span>}
              {content.bcc && <span>Bcc: {content.bcc}</span>}
            </div>
          </>
        }
        content={
          <EmailContent
            dangerouslySetInnerHTML={{ __html: xss(content.body) }}
          />
        }
      />
    );
  }

  return (
    <ActivityRow
      data={data}
      body={data.caption}
      content={
        <ActivityContent
          isInternalNote={isInternalNote}
          dangerouslySetInnerHTML={{ __html: xss(data.content) }}
        />
      }
    />
  );
};

export default ActivityItem;
