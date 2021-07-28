import Button from 'modules/common/components/Button';
import { CenterContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import { ISegmentCondition } from '../../types';

type Props = {
  contentType: string;
  isModal?: boolean;
  addCondition: (condition: ISegmentCondition) => void;
};

function AddConditionButton(props: Props) {
  const addPropertyCondition = () => {
    props.addCondition({
      key: Math.random().toString(),
      type: 'property',
      propertyName: '',
      propertyValue: '',
      propertyOperator: ''
    });
  };

  const addEventCondition = () => {
    props.addCondition({
      key: Math.random().toString(),
      type: 'event',
      eventAttributeFilters: []
    });
  };

  const renderAddEvents = () => {
    const { isModal } = props;

    if (
      !['customer', 'lead', 'visitor'].includes(props.contentType) ||
      isModal
    ) {
      return null;
    }

    return (
      <Button
        id="segment-add-events"
        btnStyle="primary"
        icon="computer-mouse"
        onClick={addEventCondition}
      >
        {__('Add Events')}
      </Button>
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
