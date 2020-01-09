import Icon from 'modules/common/components/Icon';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { FlexContent } from 'modules/layout/styles';
import React from 'react';
import { ISegment, ISegmentDoc, ISegmentField } from '../types';
import Form from './common/Form';
import { ResultCount, SegmentResult } from './styles';

type Props = {
  contentType: string;
  fields: ISegmentField[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  segment: ISegment;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  counterLoading: boolean;
  total: {
    byFakeSegment?: number;
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
                total.byFakeSegment || 0
              )}
            </ResultCount>
            {__('User(s) will recieve this message')}
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
    headSegments,
    count
  } = props;

  const title = props.segment ? __('Edit segment') : __('New segment');

  const breadcrumb = [
    { title: __('Segments'), link: `/segments/${contentType}` },
    { title }
  ];

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      content={
        <Form
          contentType={contentType}
          fields={fields}
          renderButton={renderButton}
          segment={segment}
          headSegments={headSegments}
          count={count}
          isForm={true}
        />
      }
      rightSidebar={renderSidebar()}
    />
  );
};

export default SegmentsForm;
