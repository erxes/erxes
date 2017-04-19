import React from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Loader, LoadingContent, LoadingSidebar } from '/imports/react-ui/common';
import { Table } from 'react-bootstrap';

function Loading() {
  const content = (
    <Table className="no-wrap loading-table">
      <thead>
        <tr>
          <th width="30" className="less-space" />
          <th width="24%"><div className="line animate" /></th>
          <th width="20%"><div className="line animate" /></th>
          <th width="18%"><div className="line animate" /></th>
          <th width="17%"><div className="line animate" /></th>
          <th width="10%"><div className="line animate" /></th>
          <th width="10%"><div className="line animate" /></th>
        </tr>
      </thead>
      <LoadingContent isTable items={10} />
    </Table>
  );

  return (
    <div>
      <Loader />
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Customers' }]} />}
        leftSidebar={<LoadingSidebar items={4} />}
        content={content}
      />
    </div>
  );
}

export default Loading;
