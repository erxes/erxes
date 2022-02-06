import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import Label from 'modules/common/components/Label';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { EMPTY_SEGMENT_CONTENT } from 'modules/settings/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { ISegment } from '../types';
import Sidebar from './Sidebar';

type Props = {
  contentType?: string;
  segments: ISegment[];
  loading: boolean;
  removeSegment: (segmentId: string) => void;
};

class SegmentsList extends React.Component<Props> {
  renderActionButtons(segment) {
    const { contentType, removeSegment } = this.props;

    const onClick = () => {
      removeSegment(segment._id);
    };

    return (
      <ActionButtons>
        <Tip text={__('Edit')} placement="top">
          <Link to={`/segments/edit/${contentType}/${segment._id}`}>
            <Button btnStyle="link" icon="edit-3" />
          </Link>
        </Tip>
        <Tip text={__('Delete')} placement="top">
          <Button btnStyle="link" onClick={onClick} icon="times-circle" />
        </Tip>
      </ActionButtons>
    );
  }

  renderContent(segments) {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Description')}</th>
            <th>{__('Color')}</th>
            <th style={{ width: 80 }} />
          </tr>
        </thead>
        <tbody id={'SegmentShowing'}>
          {segments.map(segment => (
            <tr key={segment._id}>
              <td>
                {segment.subOf ? '\u00a0\u00a0' : null} {segment.name}
              </td>
              <td>{segment.description}</td>
              <td>
                <Label lblColor={segment.color}>{segment.color}</Label>
              </td>
              <td>{this.renderActionButtons(segment)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { contentType, loading, segments } = this.props;
    const parentSegments: ISegment[] = [];

    segments.forEach(segment => {
      if (!segment.subOf) {
        parentSegments.push(segment, ...segment.getSubSegments);
      }
    });

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Segments') }
    ];

    const title = (
      <Title capitalize={true}>
        {contentType} {__('segments')}
      </Title>
    );

    const actionBarRight = (
      <Link id={'NewSegmentButton'} to={`/segments/new/${contentType}`}>
        <Button btnStyle="success" icon="plus-circle">
          New segment
        </Button>
      </Link>
    );

    const actionBar = <Wrapper.ActionBar left={title} right={actionBarRight} />;

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Segments')} breadcrumb={breadcrumb} />
        }
        actionBar={actionBar}
        content={
          <DataWithLoader
            data={this.renderContent(parentSegments)}
            loading={loading}
            count={parentSegments.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_SEGMENT_CONTENT}
                maxItemWidth="330px"
              />
            }
          />
        }
        leftSidebar={<Sidebar />}
      />
    );
  }
}

export default SegmentsList;
