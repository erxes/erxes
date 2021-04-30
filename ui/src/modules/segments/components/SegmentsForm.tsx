import { IBoard } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { Title } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { FlexContent } from 'modules/layout/styles';
import React from 'react';
import { IEvent, ISegment, ISegmentCondition } from '../types';
import Form from './common/Form';
import { ResultCount, SegmentResult } from './styles';

type Props = {
  contentType: string;
  fields: any[];
  events: IEvent[];
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  segment: ISegment;
  headSegments: ISegment[];
  count: number;
  fetchFields: (pipelineId?: string) => void;
  previewCount: (args: {
    conditions: ISegmentCondition[];
    subOf?: string;
    boardId?: string;
    pipelineId?: string;
  }) => void;
  counterLoading: boolean;
};

const SegmentsForm = (props: Props) => {
  const renderHelpText = () => {
    let text = 'User(s) will receive this message';

    if (!['customer', 'lead', 'visitor'].includes(contentType)) {
      text = `${contentType}(s) found.`;
    }

    return text;
  };

  const renderSidebar = () => {
    const { count, counterLoading } = props;

    return (
      <Sidebar full={true} wide={true}>
        <FlexContent>
          <SegmentResult>
            <ResultCount>
              {counterLoading ? (
                <Spinner objective={true} />
              ) : (
                <span>{count}</span>
              )}
            </ResultCount>
            {renderHelpText()}
          </SegmentResult>
        </FlexContent>
      </Sidebar>
    );
  };

  const {
    contentType,
    fields,
    renderButton,
    segment,
    events,
    headSegments,
    boards,
    fetchFields,
    previewCount
  } = props;

  const title = props.segment
    ? __(`Editing ${contentType} segment`)
    : __(`Creating ${contentType} segment`);

  const pageTitle = <Title>{title}</Title>;
  const breadcrumb = [
    { title: __('Segments'), link: `/segments/${contentType}` },
    { title }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      actionBar={<Wrapper.ActionBar left={pageTitle} />}
      content={
        <Form
          contentType={contentType}
          fields={fields}
          events={events}
          boards={boards}
          renderButton={renderButton}
          segment={segment}
          headSegments={headSegments}
          fetchFields={fetchFields}
          previewCount={previewCount}
          isForm={true}
        />
      }
      rightSidebar={renderSidebar()}
    />
  );
};

export default SegmentsForm;
