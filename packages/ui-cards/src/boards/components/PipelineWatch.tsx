import { IPipeline } from "../types";
import Icon from "@erxes/ui/src/components/Icon";
import { __ } from "coreui/utils";
import * as React from "react";
import { HeaderButton } from "../styles/header";

type IProps = {
  pipeline: IPipeline;
  onChangeWatch: (isAdd: boolean) => void;
};

class Watch extends React.Component<IProps> {
  render() {
    const {
      onChangeWatch,
      pipeline: { isWatched },
    } = this.props;

    const onClick = () => onChangeWatch(!isWatched);

    return (
      <HeaderButton onClick={onClick} hasBackground={true} isActive={isWatched}>
        <Icon icon="eye" />
        {isWatched ? __("Watching") : __("Watch")}
      </HeaderButton>
    );
  }
}

export default Watch;
