import React from 'react';
import {
  ChecklistText,
  ChecklistTitleWrapper,
  ChecklistTitle,
  Progress,
  ChecklistWrapper,
  ChecklistItem
} from '../../common/Checklist';
import ProgressBar from '../../common/ProgressBar';
import { colors } from '../../styles';
import Icon from '../../common/Icon';
import { FormControl } from '../../common/form';
type Props = {
  checklist?: any;
};

function ChecklistDetail({ checklist }: Props) {
  const renderItems = () => {
    return checklist.items?.map(item => {
      const { isChecked } = item;

      return (
        <ChecklistItem key={item._id}>
          <FormControl
            componentClass="checkbox"
            checked={isChecked}
            disabled={true}
          />
          <ChecklistText isChecked={isChecked}>
            <label>{item.content}</label>
          </ChecklistText>
        </ChecklistItem>
      );
    });
  };

  const renderProgressBar = () => {
    return (
      <Progress>
        <span>{checklist.percent?.toFixed(0)}%</span>
        <ProgressBar
          percentage={checklist.percent}
          height="10px"
          color={colors.colorPrimary}
        />
      </Progress>
    );
  };

  return (
    <>
      <ChecklistTitleWrapper>
        <Icon icon="checked" />

        <ChecklistTitle>
          <h5>{checklist.title}</h5>
        </ChecklistTitle>
      </ChecklistTitleWrapper>
      {renderProgressBar()}

      <ChecklistWrapper>{renderItems()}</ChecklistWrapper>
    </>
  );
}

export default ChecklistDetail;
