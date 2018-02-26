import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Tip, ActionButtons, Button, Table } from 'modules/common/components';

const propTypes = {
  contentType: PropTypes.string.isRequired,
  segments: PropTypes.array.isRequired,
  removeSegment: PropTypes.func.isRequired
};

function SegmentsList({ contentType, segments, removeSegment }, { __ }) {
  const remove = id => {
    removeSegment(id);
  };

  const parentSegments = [];

  segments.forEach(segment => {
    if (!segment.subOf) {
      parentSegments.push(segment, ...segment.getSubSegments);
    }
  });

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Name')}</th>
          <th>{__('Description')}</th>
          <th>{__('Color')}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {parentSegments.map(segment => (
          <tr key={segment._id}>
            <td>
              {segment.subOf ? '\u2014\u2014' : null} {segment.name}
            </td>
            <td>{segment.description}</td>
            <td>{segment.color}</td>
            <td>
              <ActionButtons>
                <Tip text={__('Edit')}>
                  <Link to={`/segments/edit/${contentType}/${segment._id}`}>
                    <Button btnStyle="link" icon="edit" />
                  </Link>
                </Tip>
                <Tip text={__('Delete')}>
                  <Button
                    btnStyle="link"
                    onClick={() => {
                      remove(segment._id);
                    }}
                    icon="close"
                  />
                </Tip>
              </ActionButtons>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const actionBarRight = (
    <Link to={`/segments/new/${contentType}`}>
      <Button btnStyle="success" size="small" icon="plus">
        New segment
      </Button>
    </Link>
  );

  const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

  return (
    <Wrapper
      header={<Wrapper.Header breadcrumb={[{ title: __('Segments') }]} />}
      actionBar={actionBar}
      content={content}
    />
  );
}

SegmentsList.propTypes = propTypes;
SegmentsList.contextTypes = {
  __: PropTypes.func
};

export default SegmentsList;
