import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Tip,
  ActionButtons,
  Button,
  Table,
  Label
} from 'modules/common/components';

const propTypes = {
  contentType: PropTypes.string.isRequired,
  segments: PropTypes.array.isRequired,
  removeSegment: PropTypes.func.isRequired
};

class SegmentsList extends Component {
  renderActionButtons(segment) {
    const { contentType, removeSegment } = this.props;
    const { __ } = this.context;

    return (
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
              removeSegment(segment._id);
            }}
            icon="cancel-1"
          />
        </Tip>
      </ActionButtons>
    );
  }

  renderContent() {
    const { segments } = this.props;
    const { __ } = this.context;

    const parentSegments = [];

    segments.forEach(segment => {
      if (!segment.subOf) {
        parentSegments.push(segment, ...segment.getSubSegments);
      }
    });

    return (
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
                {segment.subOf ? '\u00a0\u00a0' : null} {segment.name}
              </td>
              <td>{segment.description}</td>
              <td>
                <Label style={{ backgroundColor: segment.color }}>
                  {segment.color}
                </Label>
              </td>
              <td>{this.renderActionButtons(segment)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { contentType } = this.props;
    const { __ } = this.context;

    const actionBarRight = (
      <Link to={`/segments/new/${contentType}`}>
        <Button btnStyle="success" size="small" icon="add">
          New segment
        </Button>
      </Link>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: __('Segments') }]} />}
        actionBar={actionBar}
        content={this.renderContent()}
      />
    );
  }
}

SegmentsList.propTypes = propTypes;
SegmentsList.contextTypes = {
  __: PropTypes.func
};

export default SegmentsList;
