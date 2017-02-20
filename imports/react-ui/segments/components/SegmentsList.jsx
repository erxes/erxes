/* eslint-env browser */

import React, { PropTypes } from 'react';
import { Button, Table } from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Tip, ActionButtons } from '/imports/react-ui/common';


const propTypes = {
  segments: PropTypes.array.isRequired,
  removeSegment: PropTypes.func.isRequired,
};

function SegmentsList({ segments, removeSegment }) {
  const remove = (id) => {
    if (confirm('Are you sure?')) { // eslint-disable-line no-alert
      removeSegment({ id }, error =>
        error
          ? Alert.error(error.reason)
          : Alert.success('Successfully deleted.'));
    }
  };

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
        {
          segments.map(segment =>
            <tr key={segment._id}>
              <td>{segment.name}</td>
              <td>{segment.description}</td>
              <td>{segment.color}</td>
              <td className="text-right">
                <ActionButtons>
                  <Tip text="Edit">
                    <Button bsStyle="link" href={FlowRouter.path('segments/edit', { id: segment._id })}>
                      <i className="ion-edit" />
                    </Button>
                  </Tip>
                  <Tip text="Delete">
                    <Button bsStyle="link" onClick={() => { remove(segment._id); }}>
                      <i className="ion-close-circled" />
                    </Button>
                  </Tip>
                </ActionButtons>
              </td>
            </tr>,
          )
        }
      </tbody>
    </Table>
  );

  const actionBarLeft = (
    <Button bsStyle="link" href={FlowRouter.path('segments/new')}>
      <i className="ion-plus-circled" /> New segment
    </Button>
  );
  const actionBar = (
    <Wrapper.ActionBar left={actionBarLeft} />
  );

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Segments' }]} />}
        actionBar={actionBar}
        content={content}
      />
    </div>
  );
}

SegmentsList.propTypes = propTypes;

export default SegmentsList;
