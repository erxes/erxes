import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Label from 'modules/common/components/Label';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { ISegment } from '../types';
import Sidebar from './Sidebar';

type Props = {
  contentType?: string;
  segments: ISegment[];
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

  renderContent() {
    const { segments } = this.props;

    const parentSegments: ISegment[] = [];

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
    const { contentType } = this.props;

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
      <Link to={`/segments/new/${contentType}`}>
        <Button btnStyle="primary" uppercase={false} icon="plus-circle">
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
        content={this.renderContent()}
        leftSidebar={<Sidebar />}
      />
    );
  }
}

export default SegmentsList;
