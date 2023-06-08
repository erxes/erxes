import React from 'react';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { queries } from '../graphql';
import { IssueItem } from '../../styles';
import Label from '@erxes/ui/src/components/Label';
import Button from '@erxes/ui/src/components/Button';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';

type Props = {
  item: any;
  rcfaDetail?: any;
};

interface IIssue {
  _id: string;
  issue: string;
  parentId: string | null;
  rcfaId?: string;
  createdAt?: string;
  createdUser?: string;
  __v?: number;
}

class TableDetail extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  seeTask = () => {};

  render() {
    const { rcfaDetail } = this.props;

    let issues = [];

    if (!rcfaDetail.loading) {
      issues = rcfaDetail.rcfaDetail.issues;
    }

    let issueList = issues.map((issue: IIssue, index: number) => (
      <IssueItem key={issue._id}>
        <h2
          style={{
            margin: '0 1rem 0 0',
            color: index == issues.length - 1 ? '#673FBD' : ''
          }}
        >
          {index + 1}
        </h2>
        <div>
          <p style={{ marginBottom: '0' }}>{issue.issue}</p>
          {index == issues.length - 1 ? (
            <>
              <p>
                <Label lblStyle="danger">Root cause</Label>
              </p>
              <Button
                size="small"
                onClick={() => {
                  this.seeTask;
                }}
              >
                See task
              </Button>
            </>
          ) : (
            ''
          )}
        </div>
      </IssueItem>
    ));

    return <div>{issueList}</div>;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.rcfa), {
      name: 'rcfaDetail',
      options: (props: any) => ({
        variables: {
          _id: props.item._id
        }
      })
    })
  )(TableDetail)
);
