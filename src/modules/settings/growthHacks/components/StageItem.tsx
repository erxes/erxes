import { IStage } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import { StageItemContainer } from 'modules/settings/boards/styles';
import React from 'react';
import FormList from '../containers/FormList';

type Props = {
  stage: IStage;
  remove: (stageId: string) => void;
  onChange: (stageId: string, name: string, value: string) => void;
  onKeyPress: (e: any) => void;
};

class StageItem extends React.Component<Props, {}> {
  render() {
    const { stage, onChange, onKeyPress, remove } = this.props;

    const onChangeName = (stageId, e) =>
      onChange(stageId, e.target.name, e.target.value);
    const onChangeForm = (stageId, value) => {
      onChange(stageId, 'formId', value);
    };

    return (
      <StageItemContainer key={stage._id}>
        <FormControl
          defaultValue={stage.name}
          type="text"
          placeholder="Stage name"
          onKeyPress={onKeyPress}
          autoFocus={true}
          name="name"
          onChange={onChangeName.bind(this, stage._id)}
        />

        <FormList onChangeForm={onChangeForm} stage={stage} />

        <Button
          btnStyle="danger"
          size="small"
          onClick={remove.bind(this, stage._id)}
          icon="cancel-1"
        />
      </StageItemContainer>
    );
  }
}

export default StageItem;
