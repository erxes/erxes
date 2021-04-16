import { IStage } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
// import FormControl from 'modules/common/components/form/Control';
import { __ } from 'modules/common/utils';
import React from 'react';

type Props = {
  stage: IStage;
  type: string;
  remove: (stageId: string) => void;
  onChange: (stageId: string, name: string, value: string) => void;
};

class StageItem extends React.Component<Props, {}> {
  render() {
    const { stage, remove } = this.props;

    // const onChangeName = (stageId, e) =>
    //   onChange(stageId, e.target.name, e.target.value);
    // const onChangeProbability = (stageId, e) =>
    //   onChange(stageId, e.target.name, e.target.value);
    // const onChangeStatus = (stageId, e) =>
    //   onChange(stageId, e.target.name, e.target.value);

    return (
      <>
        <Button
          btnStyle="link"
          size="small"
          onClick={remove.bind(this, stage._id)}
          icon="times"
        />
      </>
    );
  }
}

export default StageItem;
