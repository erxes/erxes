import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Tip,
  ActionButtons,
  Button,
  Icon,
  Table
} from 'modules/common/components';

const propTypes = {
  contentType: PropTypes.string.isRequired,
  segments: PropTypes.array.isRequired,
  removeSegment: PropTypes.func.isRequired
};

function SegmentsList({ contentType, segments, removeSegment }) {
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
          <th>Name</th>
          <th>Description</th>
          <th>Color</th>
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
                <Tip text="Edit">
                  <Button
                    btnStyle="link"
                    href={`/segments/edit/${contentType}/${segment._id}`}
                  >
                    <Icon icon="edit" />
                  </Button>
                </Tip>
                <Tip text="Delete">
                  <Button
                    btnStyle="link"
                    onClick={() => {
                      remove(segment._id);
                    }}
                  >
                    <Icon icon="close-circled" />
                  </Button>
                </Tip>
              </ActionButtons>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const actionBarLeft = (
    <Button btnStyle="success" href={`/segments/new/${contentType}`}>
      <Icon icon="plus-circled" /> New segment
    </Button>
  );

  const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

  return (
    <Wrapper
      header={<Wrapper.Header breadcrumb={[{ title: 'Segments' }]} />}
      actionBar={actionBar}
      content={content}
    />
  );
}

SegmentsList.propTypes = propTypes;

export default SegmentsList;
