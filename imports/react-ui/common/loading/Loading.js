import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Loader, LoadingContent, LoadingSidebar, Spinner } from '/imports/react-ui/common';
import { Table } from 'react-bootstrap';

const propTypes = {
  sidebarSize: PropTypes.string,
  spin: PropTypes.bool,
  title: PropTypes.string.isRequired,
  hasRightSidebar: PropTypes.bool,
};

function Loading({ sidebarSize, spin = false, title, hasRightSidebar = false }) {
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
        leftSidebar={<LoadingSidebar size={sidebarSize} items={4} />}
        content={content}
        rightSidebar={hasRightSidebar ? <LoadingSidebar items={4} /> : null}
        relative
      />
    </div>
  );
}

Loading.propTypes = propTypes;

export default Loading;
