import { Button, Icon, Spinner } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Sidebar, Wrapper } from 'modules/layout/components';
import { FlexContent } from 'modules/layout/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ISegment, ISegmentDoc, ISegmentField } from '../types';
import Form from './common/Form';
import { ResultCount, SegmentResult } from './styles';

type Props = {
  contentType: string;
  fields: ISegmentField[];
  segment: ISegment;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  counterLoading: boolean;
  total: {
    byFakeSegment: number;
  };
};

const SegmentsForm = (props: Props) => {
  const renderSidebar = () => {
    const { total, counterLoading } = props;

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
  };

  const renderFooter = (saveBtn: React.ReactNode) => {
    return (
      <Wrapper.ActionBar
        right={
          <Button.Group>
            <Link to={`/segments/${props.contentType}`}>
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

  const renderForm = ({
    renderContent,
    saveButton
  }: {
    renderContent: React.ReactNode;
    saveButton: React.ReactNode;
  }) => {
    const title = props.segment ? __('Edit segment') : __('New segment');

    const breadcrumb = [
      { title: __('Segments'), link: `/segments/${contentType}` },
      { title }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        content={renderContent}
        footer={renderFooter(saveButton)}
        rightSidebar={renderSidebar()}
      />
    );
  };

  const {
    contentType,
    fields,
    segment,
    headSegments,
    count,
    renderButton
  } = props;

  return (
    <Form
      contentType={contentType}
      fields={fields}
      segment={segment}
      headSegments={headSegments}
      count={count}
      renderForm={renderForm}
      renderButton={renderButton}
    />
  );
};

export default SegmentsForm;
