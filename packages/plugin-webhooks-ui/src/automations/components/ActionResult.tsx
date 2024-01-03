import { Button, ModalTrigger } from '@erxes/ui/src';
import React from 'react';

const ActionResult = ({ result }) => {
  const { url, method, data, headers, status } = result || {};

  if (!status && status !== 'success') {
    return <>{JSON.stringify(result)}</>;
  }

  function syntaxHighlight(json) {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function(match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  const renderContent = () => {
    return (
      <>
        <ul>
          <strong>{'Url: '}</strong>
          {`${url}`}
        </ul>
        <ul>
          <strong>{'Method: '}</strong>
          {`${method}`}
        </ul>
        <ul>
          <strong>{'Headers:'}</strong>
          {Object.keys(headers || {}).length ? (
            <pre>
              <code>
                <div
                  dangerouslySetInnerHTML={{ __html: syntaxHighlight(headers) }}
                />
              </code>
            </pre>
          ) : (
            ''
          )}
        </ul>

        <ul>
          <strong>{'Body: '}</strong>
          <pre>
            <code>
              <div
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(data) }}
              />
            </code>
          </pre>
        </ul>
      </>
    );
  };

  return (
    <ModalTrigger
      title="Webhook Result"
      size="xl"
      content={renderContent}
      trigger={<Button icon="eye" btnStyle="link" />}
    />
  );
};

export default ActionResult;
