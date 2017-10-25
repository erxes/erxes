import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { Wrapper } from '../../../layout/components';
import { Loader, LoadingContent, LoadingSidebar, Spinner } from '../';

const propTypes = {
  sidebarSize: PropTypes.string,
  spin: PropTypes.bool,
  title: PropTypes.string.isRequired,
  hasRightSidebar: PropTypes.bool,
  items: PropTypes.number
};

function Loading({
  sidebarSize,
  spin = false,
  title,
  hasRightSidebar = false,
  items = 4
}) {
  let content = (
    <Table className="no-wrap loading-table">
      <thead>
        <tr>
          <th width="30" className="less-space" />
          <th width="24%">
            <div className="line animate" />
          </th>
          <th width="20%">
            <div className="line animate" />
          </th>
          <th width="18%">
            <div className="line animate" />
          </th>
          <th width="17%">
            <div className="line animate" />
          </th>
          <th width="10%">
            <div className="line animate" />
          </th>
          <th width="10%">
            <div className="line animate" />
          </th>
        </tr>
      </thead>
      <LoadingContent isTable items={10} />
    </Table>
  );

  if (spin) {
    content = (
      <div className="full-loader">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Loader />
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: title }]} />}
        leftSidebar={<LoadingSidebar size={sidebarSize} items={items} />}
        content={content}
        rightSidebar={hasRightSidebar ? <LoadingSidebar items={items} /> : null}
        relative
      />
    </div>
  );
}

Loading.propTypes = propTypes;

export default Loading;
