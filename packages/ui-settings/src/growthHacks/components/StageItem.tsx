import { IStage } from '@erxes/ui-cards/src/boards/types';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { colors } from '@erxes/ui/src/styles';
import { __ } from '@erxes/ui/src/utils/core';
import { StageItemContainer } from '@erxes/ui-settings/src/boards/styles';
import React from 'react';

type Props = {
  stage: IStage;
  remove: (stageId: string) => void;
  onChange: (stageId: string, name: string, value: string) => void;
  onClick: (stage: IStage) => void;
  onKeyPress: (e: any) => void;
};

class StageItem extends React.Component<Props, {}> {
  render() {
    const { stage, onChange, onKeyPress, remove, onClick } = this.props;

    const onChangeName = (stageId, e) =>
      onChange(stageId, e.target.name, e.target.value);

    const onBuildClick = e => {
      onClick(stage);
    };

    return (
      <StageItemContainer key={stage._id}>
        <FormControl
          defaultValue={stage.name}
          type="text"
          placeholder={__('Stage name')}
          onKeyPress={onKeyPress}
          autoFocus={true}
          name="name"
          onChange={onChangeName.bind(this, stage._id)}
        />
        <Tip text="Build a form">
          <Button btnStyle="link" onClick={onBuildClick}>
            <Icon
              icon={stage.formId ? 'file-edit-alt' : 'file-plus-alt'}
              color={
                stage.formId ? colors.colorSecondary : colors.colorCoreGreen
              }
            />
          </Button>
        </Tip>

        <Button
          btnStyle="link"
          onClick={remove.bind(this, stage._id)}
          icon="times"
        />
      </StageItemContainer>
    );
  }
}

export default StageItem;
