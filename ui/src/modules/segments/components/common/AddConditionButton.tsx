import Button from 'modules/common/components/Button';
import { CenterContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import { ISegmentCondition } from '../../types';

type Props = {
  segmentKey?: string;
  contentType: string;
  isModal?: boolean;
  addCondition: (condition: ISegmentCondition, segmentKey?: string) => void;
};

function AddConditionButton(props: Props) {
  const { segmentKey, isModal } = props;

  const addPropertyCondition = () => {
    props.addCondition(
      {
        key: Math.random().toString(),
        type: 'property',
        propertyName: '',
        propertyValue: '',
        propertyOperator: ''
      },
      isModal ? segmentKey : ''
    );
  };

  const addEventCondition = () => {
    props.addCondition(
      {
        key: Math.random().toString(),
        type: 'event',
        eventAttributeFilters: []
      },
      isModal ? segmentKey : ''
    );
  };

  const addFormCondition = () => {
    props.addCondition({
      key: Math.random().toString(),
      type: 'property',
      propertyType: 'form_submission',
      propertyName: '',
      propertyValue: '',
      propertyOperator: ''
    });
  };

  const renderAddEvents = () => {
    if (
      !['customer', 'lead', 'visitor'].includes(props.contentType) ||
      isModal
    ) {
      return null;
    }

    return (
      <>
        <Button
          id="segment-add-properties"
          btnStyle="primary"
          icon="segment"
          onClick={addFormCondition}
        >
          {__('Add Segment')}
        </Button>

        <Button
          id="segment-add-events"
          btnStyle="primary"
          icon="computer-mouse"
          onClick={addEventCondition}
        >
          {__('Add Events')}
        </Button>
      </>
    );
  };

  return (
    <CenterContent>
      <Button.Group hasGap={false}>
        <Button
          id="segment-add-properties"
          btnStyle="primary"
          icon="subject"
          onClick={addPropertyCondition}
        >
          {__('Add Properties')}
        </Button>

        {renderAddEvents()}
      </Button.Group>
    </CenterContent>
  );
}

export default AddConditionButton;
