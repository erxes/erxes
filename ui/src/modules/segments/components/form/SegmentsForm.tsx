import { ITrigger } from 'modules/automations/types';
import { IBoard } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { Title } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { FlexContent } from 'modules/layout/styles';
import React from 'react';
import { IEvent, ISegment, ISegmentCondition } from '../../types';
import Form from './Form';
import { ResultCount, SegmentResult } from '../styles';

type Props = {
  contentType: string;
  fields: any[];
  events: IEvent[];
  boards: IBoard[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  segment: ISegment;
  headSegments: ISegment[];
  segments: ISegment[];
  count: number;
  previewCount: (args: {
    conditions: ISegmentCondition[];
    subOf?: string;
    conditionsConjunction?: string;
  }) => void;
  counterLoading: boolean;
  isModal: boolean;
  isAutomation?: boolean;
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger?: ITrigger;
};

const SegmentsForm = (props: Props) => {
  const renderHelpText = () => {
    let text = 'User(s) will receive this message';

    if (!['customer', 'lead', 'visitor'].includes(contentType)) {
      text = `${contentType}(s) found.`;
    }

    return text;
  };

  const {
    contentType,
    fields,
    renderButton,
    segment,
    events,
    headSegments,
    boards,
    isModal,
    isAutomation,
    closeModal,
    segments,
    previewCount,
    count
  } = props;

  const renderSidebar = () => {
    const { counterLoading } = props;

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

  const title = props.segment
    ? __(`Editing ${contentType} segment`)
    : __(`Creating ${contentType} segment`);

  const pageTitle = <Title>{title}</Title>;
  const breadcrumb = [
    { title: __('Segments'), link: `/segments/${contentType}` },
    { title }
  ];

  const content = (
    <Form
      contentType={contentType}
      fields={fields}
      events={events}
      boards={boards}
      renderButton={renderButton}
      segment={segment}
      headSegments={headSegments}
      segments={segments}
      closeModal={closeModal}
      isModal={isModal}
      isAutomation={isAutomation}
      previewCount={previewCount}
      count={count}
    />
  );

  return isModal ? (
    content
  ) : (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      actionBar={<Wrapper.ActionBar left={pageTitle} />}
      content={content}
      rightSidebar={renderSidebar()}
    />
  );
};

export default SegmentsForm;
