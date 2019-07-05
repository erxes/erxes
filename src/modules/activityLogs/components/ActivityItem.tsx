import { ActivityContent, EmailContent } from 'modules/activityLogs/styles';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import xss from 'xss';
import ActivityRow from './ActivityRow';

type Props = {
  data: any;
};

const ActivityItem = (props: Props) => {
  const { data } = props;
  const { action, content, caption } = data;

  let isInternalNote = false;

  if (action === 'internal_note-create') {
    isInternalNote = true;
  }

  if (action.includes('merge')) {
    const ids = content.split(',');
    const type = action.includes('customer') ? 'customers' : 'companies';

    return (
      <ActivityRow
        data={caption}
        body={
          <>
            {__('Merged')}

            {ids.map((id: string, index: number) => {
              return (
                <a
                  style={{ display: 'inline-block', padding: '0px 3px' }}
                  key={id}
                  href={`/${type}/details/${id}`}
                  target="__blank"
                >
                  {index + 1},
                </a>
              );
            })}

            {type}
          </>
        }
        content={''}
      />
    );
  }

  if (action === 'email-send') {
    try {
      const parsedContent = JSON.parse(content);

      return (
        <ActivityRow
          data={data}
          body={
            <>
              <p>{parsedContent.subject}</p>
              <div>
                {caption}
                <Icon icon="rightarrow" /> To:{' '}
                <span>{parsedContent.toEmails}</span>
                {parsedContent.cc && <span>Cc: {parsedContent.cc}</span>}
                {parsedContent.bcc && <span>Bcc: {parsedContent.bcc}</span>}
              </div>
            </>
          }
          content={
            <EmailContent
              dangerouslySetInnerHTML={{ __html: xss(parsedContent.body) }}
            />
          }
        />
      );
      // means email from customer or company detail
    } catch (e) {
      return (
        <ActivityRow
          data={data}
          body={caption}
          content={
            <EmailContent dangerouslySetInnerHTML={{ __html: xss(content) }} />
          }
        />
      );
    }
  }

  return (
    <ActivityRow
      data={data}
      body={caption}
      content={
        <ActivityContent
          isInternalNote={isInternalNote}
          dangerouslySetInnerHTML={{ __html: xss(content) }}
        />
      }
    />
  );
};

export default ActivityItem;
