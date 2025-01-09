import DrawerContent from "../components/DrawerContent";
import React from "react";

type Props = {
  content: any;
  tasks: any;
  setShow: any;
  completedSteps: string[];
};

class DrawerContentContainer extends React.Component<Props> {
  render() {
    return <DrawerContent {...this.props} />;
  }
}

export default DrawerContentContainer;
