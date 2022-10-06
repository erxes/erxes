import { ITrigger } from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Title } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import { Sidebar, Wrapper, FlexContent } from '@erxes/ui/src/layout';
import React from 'react';
import { IEvent, ISegment, ISegmentCondition } from '../../types';
import Form from './Form';
import { ResultCount, SegmentResult } from '../styles';

type Props = {
  contentType: string;
  fields: any[];
  events: IEvent[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  filterContent?: (values: any) => void;
  segment: ISegment;
  headSegments: ISegment[];
  segments: ISegment[];
  count: number;
  previewCount: (args: {
    conditions: ISegmentCondition[];
    subOf?: string;
    config?: any;
    conditionsConjunction?: string;
  }) => void;
  counterLoading: boolean;
  isModal: boolean;
  hideDetailForm?: boolean;
  usageType?: string;
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger?: ITrigger;
};

const SegmentsForm = (props: Props) => {
  const renderHelpText = () => {
    return `${contentType}(s) found.`;
  };

  const {
    contentType,
    fields,
    renderButton,
    segment,
    events,
    headSegments,
    isModal,
    hideDetailForm,
    closeModal,
    segments,
    previewCount,
    count,
    usageType,
    filterContent
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
    { title: __('Segments'), link: `/segments?contentType=${contentType}` },
    { title }
  ];

  const content = (
    <Form
      contentType={contentType}
      fields={fields}
      events={events}
      renderButton={renderButton}
      segment={segment}
      headSegments={headSegments}
      segments={segments}
      closeModal={closeModal}
      isModal={isModal}
      hideDetailForm={hideDetailForm}
      previewCount={previewCount}
      count={count}
      usageType={usageType}
      filterContent={filterContent}
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
