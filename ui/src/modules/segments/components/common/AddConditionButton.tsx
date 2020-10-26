import Button from 'modules/common/components/Button';
import { CenterContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import { ISegmentCondition } from '../../types';

type Props = {
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

  return (
    <CenterContent>
      <Button.Group hasGap={false}>
        <Button
          id="segment-add-properties"
          btnStyle="primary"
          icon="subject"
          uppercase={false}
          onClick={addPropertyCondition}
        >
          {__('Add Properties')}
        </Button>

        <Button
          id="segment-add-events"
          btnStyle="primary"
          icon="computer-mouse"
          uppercase={false}
          onClick={addEventCondition}
        >
          {__('Add Events')}
        </Button>
      </Button.Group>
    </CenterContent>
  );
}

export default AddConditionButton;
