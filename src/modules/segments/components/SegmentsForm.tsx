import { Button, Icon, Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar, Wrapper } from 'modules/layout/components';
import { FlexContent } from 'modules/layout/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ISegment,
  ISegmentConditionDoc,
  ISegmentDoc,
  ISegmentField
} from '../types';
import Form from './common/Form';
import { ResultCount, SegmentResult } from './styles';

type SegmentDoc = {
  name: string;
  description: string;
  subOf: string;
  color: string;
  connector: string;
  conditions: ISegmentConditionDoc[];
};

type Props = {
  contentType: string;
  fields: ISegmentField[];
  create: (params: { doc: SegmentDoc }) => void;
  edit: (params: { _id: string; doc: SegmentDoc }) => void;
  segment: ISegment;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  counterLoading: boolean;
  total: {
    byFakeSegment: number;
  };
};

class SegmentsForm extends React.Component<Props> {
  renderSidebar() {
    const { total, counterLoading } = this.props;

    return (
      <Sidebar full={true} wide={true}>
        <FlexContent>
          <SegmentResult>
            <ResultCount>
              <Icon icon="users" />{' '}
              {counterLoading ? (
                <Spinner objective={true} />
              ) : (
                total.byFakeSegment
              )}
            </ResultCount>
            {__('User(s) will recieve this message')}
          </SegmentResult>
        </FlexContent>
      </Sidebar>
    );
  }

  renderFooter = (saveBtn: React.ReactNode) => {
    const { contentType } = this.props;

    return (
      <Wrapper.ActionBar
        right={
          <Button.Group>
            <Link to={`/segments/${contentType}`}>
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>
            {saveBtn}
          </Button.Group>
        }
      />
    );
  };

  renderContent = ({
    formContent,
    footerContent
  }: {
    formContent: React.ReactNode;
    footerContent: React.ReactNode;
  }) => {
    const { contentType, segment } = this.props;

    const title = segment ? __('Edit segment') : __('New segment');

    const breadcrumb = [
      { title: __('Segments'), link: `/segments/${contentType}` },
      { title }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        content={formContent}
        footer={this.renderFooter(footerContent)}
        rightSidebar={this.renderSidebar()}
      />
    );
  };

  render() {
    const {
      contentType,
      fields,
      create,
      edit,
      segment,
      headSegments,
      count
    } = this.props;

    return (
      <Form
        contentType={contentType}
        fields={fields}
        create={create}
        edit={edit}
        segment={segment}
        headSegments={headSegments}
        count={count}
        renderForm={this.renderContent}
      />
    );
  }
}

export default SegmentsForm;
