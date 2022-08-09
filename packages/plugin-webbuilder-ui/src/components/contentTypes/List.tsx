import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
import React from 'react';
import { Link } from 'react-router-dom';
import { Flex } from '@erxes/ui/src/styles/main';
import Row from './Row';
import { IContentTypeDoc } from '../../types';

type Props = {
  queryParams: any;
  contentTypes: IContentTypeDoc[];
  remove: (contentTypeId: string) => void;
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
  contentTypesCount: number;
};

class ContentTypes extends React.Component<Props, {}> {
  renderRow() {
    const { contentTypes, remove } = this.props;

    return contentTypes.map(contentType => (
      <Row key={contentType._id} contentType={contentType} remove={remove} />
    ));
  }

  render() {
    const { getActionBar, setCount, contentTypesCount } = this.props;

    const actionBarRight = (
      <Flex>
        <Link to="contenttypes/create">
          <Button btnStyle="success" size="small" icon="plus-circle">
            Add Content Type
          </Button>
        </Link>
      </Flex>
    );

    getActionBar(actionBarRight);
    setCount(contentTypesCount);

    let content = (
      <Table whiteSpace="nowrap" hover={true}>
        <thead>
          <tr>
            <th>Display name</th>
            <th>Code</th>
            <th>Site</th>
            <th>{'Actions'}</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );

    if (contentTypesCount < 1) {
      content = (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Content types"
          size="small"
        />
      );
    }

    return <>{content}</>;
  }
}

export default ContentTypes;
