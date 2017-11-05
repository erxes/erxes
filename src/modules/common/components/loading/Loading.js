import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { LoadingContent, LoadingSidebar, Spinner } from '../';
import { TableLine, FullLoader } from './styles';

const propTypes = {
  wide: PropTypes.bool,
  spin: PropTypes.bool,
  title: PropTypes.string.isRequired,
  hasRightSidebar: PropTypes.bool,
  items: PropTypes.number
};

function Loading({
  wide,
  spin = false,
  title,
  hasRightSidebar = false,
  items = 4
}) {
  let content = (
    <Table className="no-wrap loading-table">
      <thead>
        <tr>
          <th className="less-space" width="30" />
          <th width="24%">
            <TableLine className="animate" />
          </th>
          <th width="20%">
            <TableLine className="animate" />
          </th>
          <th width="18%">
            <TableLine className="animate" />
          </th>
          <th width="17%">
            <TableLine className="animate" />
          </th>
          <th width="10%">
            <TableLine className="animate" />
          </th>
          <th width="10%">
            <TableLine className="animate" />
          </th>
        </tr>
      </thead>
      <LoadingContent isTable items={10} />
    </Table>
  );

  if (spin) {
    content = (
      <FullLoader>
        <Spinner />
      </FullLoader>
    );
  }

  return (
    <Wrapper
      header={<Wrapper.Header breadcrumb={[{ title: title }]} />}
      leftSidebar={<LoadingSidebar wide={wide} items={items} />}
      content={content}
      rightSidebar={hasRightSidebar ? <LoadingSidebar items={items} /> : null}
    />
  );
}

Loading.propTypes = propTypes;

export default Loading;
