import DrawerContent from "../components/DrawerContent";
import React from "react";
import { SetupItem, TaskType } from "../types";

type Props = {
  content: SetupItem;
  tasks: TaskType[];
  setShow: (status: boolean) => void;
  completedSteps: string[];
};

class DrawerContentContainer extends React.Component<Props> {
  render() {
    return <DrawerContent {...this.props} />;
  }
}

export default DrawerContentContainer;
