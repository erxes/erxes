import {
  DrawerBody,
  DrawerContainer,
  DrawerHeader,
  TaskItem,
  TaskItemIcon,
  Tasks,
} from "../stylesSaas";

import Icon from "@erxes/ui/src/components/Icon";
import { MarketingTasks } from "../constants";
import React from "react";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  content: any;
  setShow: any;
};

function DrawerContent({ content, setShow }: Props) {
  console.log("sss", setShow);
  const { title, image, desc } = content;

  const renderTask = (task) => {
    const { id, icon, title, desc } = task;

    return (
      <TaskItem key={id}>
        <TaskItemIcon>
          <Icon icon={icon} />
        </TaskItemIcon>
        <div>
          <h4>{title}</h4>
          <span>{desc}</span>
        </div>
      </TaskItem>
    );
  };

  return (
    <DrawerContainer>
      <DrawerHeader>
        {__("Recommended Setup")}
        <Icon icon="cancel" onClick={() => setShow(false)} />
      </DrawerHeader>
      <DrawerBody>
        <div className="drawer-img">
          <img src={image} alt="task" />
        </div>
        <h4>{title}</h4>
        <p>{desc}</p>
        <Tasks>{MarketingTasks.map((task) => renderTask(task))}</Tasks>
      </DrawerBody>
    </DrawerContainer>
  );
}

export default DrawerContent;
