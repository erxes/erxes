import * as compose from 'lodash.flowright';

import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import styled from 'styled-components';

const Shell = styled.div`
  width: 100%;

  .shell-wrap {
    width: 100%;
    margin: 10px auto 0 auto;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);

    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
  }

  .shell-top-bar {
    text-align: center;
    color: #525252;
    padding: 5px 0;
    margin: 0;
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
    font-size: 0.85em;
    border: 1px solid #cccccc;
    border-bottom: none;

    -webkit-border-top-left-radius: 3px;
    -webkit-border-top-right-radius: 3px;
    -moz-border-radius-topleft: 3px;
    -moz-border-radius-topright: 3px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;

    background: #f7f7f7; /* Old browsers */
    background: -moz-linear-gradient(
      top,
      #f7f7f7 0%,
      #b8b8b8 100%
    ); /* FF3.6+ */
    background: -webkit-gradient(
      linear,
      left top,
      left bottom,
      color-stop(0%, #f7f7f7),
      color-stop(100%, #b8b8b8)
    ); /* Chrome,Safari4+ */
    background: -webkit-linear-gradient(
      top,
      #f7f7f7 0%,
      #b8b8b8 100%
    ); /* Chrome10+,Safari5.1+ */
    background: -o-linear-gradient(
      top,
      #f7f7f7 0%,
      #b8b8b8 100%
    ); /* Opera 11.10+ */
    background: -ms-linear-gradient(top, #f7f7f7 0%, #b8b8b8 100%); /* IE10+ */
    background: linear-gradient(to bottom, #f7f7f7 0%, #b8b8b8 100%); /* W3C */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f7f7f7', endColorstr='#B8B8B8',GradientType=0 ); /* IE6-9 */
  }

  .shell-body {
    min-height: 50px;
    margin: 0;
    padding: 5px;
    list-style: none;
    background: #141414;
    color: #45d40c;
    font: 0.8em 'Andale Mono', Consolas, 'Courier New';
    line-height: 1.6em;

    -webkit-border-bottom-right-radius: 3px;
    -webkit-border-bottom-left-radius: 3px;
    -moz-border-radius-bottomright: 3px;
    -moz-border-radius-bottomleft: 3px;
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  .shell-body li:before {
    content: '$';
    position: absolute;
    left: 0;
    top: 0;
  }

  .shell-body li {
    word-wrap: break-word;
    position: relative;
    padding: 0 0 0 15px;
  }
`;

class Logs extends React.Component<any> {
  render() {
    const { logsQuery } = this.props;

    const logs = logsQuery.imapLogs || [];

    return (
      <CollapseContent
        title="IMAP"
        beforeTitle={<Icon icon="envelope-edit" />}
        transparent={true}
      >
        <Shell>
          <div className="shell-wrap">
            <p className="shell-top-bar">{__('Log messages')}</p>
            <ul className="shell-body">
              {logs.map((log, index) => (
                <li key={index}>
                  ${log.date}: {log.message}
                </li>
              ))}
            </ul>
          </div>
        </Shell>
      </CollapseContent>
    );
  }
}

export default compose(
  graphql<any>(gql(queries.logs), {
    name: 'logsQuery',
    options: ({ currentId }) => {
      return {
        variables: {
          conversationId: currentId
        },
        fetchPolicy: 'network-only'
      };
    }
  })
)(Logs);
