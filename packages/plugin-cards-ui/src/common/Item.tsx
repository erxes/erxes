import { gql, useQuery } from '@apollo/client';
import { Button, ControlLabel, Spinner } from '@erxes/ui/src/components';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';

const fields = `
    _id
    name
    pipeline {
        _id
    }
    boardId
`;

const dealQuery = gql`
    query deal($_id: String!) {
        dealDetail(_id: $_id) {
            ${fields}
        }
    }
`;

const taskQuery = gql`
    query deal($_id: String!) {
        dealDetail(_id: $_id) {
            ${fields}
        }
    }
`;

const ticketQuery = gql`
    query deal($_id: String!) {
        dealDetail(_id: $_id) {
            ${fields}
        }
    }
`;

const Item = ({ invoice }) => {
  if (!isEnabled('payment')) {
    return null;
  }

  if (
    !['cards:deal', 'cards:task', 'cards:ticket'].includes(invoice.contentType)
  ) {
    return null;
  }

  let qry;

  let link = '';

  switch (invoice.contentType) {
    case 'cards:deal':
      qry = dealQuery;
      break;
    case 'cards:task':
      qry = taskQuery;
      break;
    case 'cards:ticket':
      qry = ticketQuery;
      break;
    default:
      break;
  }

  const { loading, data } = useQuery(qry, {
    variables: { _id: invoice.contentTypeId }
  });

  if (loading) {
    return <Spinner />;
  }

  let item: any = {};

  if (data) {
    if (data.dealDetail) {
      item = data.dealDetail;
      link = `/deal/board?id=${item.boardId}&pipelineId=${item.pipeline._id}&itemId=${item._id}`;
    }

    if (data.taskDetail) {
      item = data.taskDetail;
      link = `/task/board?id=${item.boardId}&pipelineId=${item.pipeline._id}&itemId=${item._id}`;
    }

    if (data.ticketDetail) {
      item = data.ticketDetail;
      link = `/ticket/board?id=${item.boardId}&pipelineId=${item.pipeline._id}&itemId=${item._id}`;
    }
  }

  return (
    <div style={{ justifyContent: 'space-between', display: 'flex' }}>
      <SectionBodyItem>
        <Link to={link} target="_blank">
          <ControlLabel uppercase={false}>{item.name}</ControlLabel>
        </Link>
      </SectionBodyItem>
      <Button
        btnStyle="link"
        icon="eye"
        iconColor="gray"
        onClick={() => {
          window.open(link, '_blank');
        }}
      />
    </div>
  );
};

export default Item;
