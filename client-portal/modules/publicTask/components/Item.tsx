import {
  Content,
  ItemDate,
  ItemFooter,
  ItemWrapper,
  Right,
  Wrapper,
} from "../../styles/tasks";

import PriorityIndicator from "../../common/PriorityIndicator";
import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/router";

type Props = {
  tasks: any;
};

function ItemContainer({ tasks }: Props) {
  const router = useRouter();
  const { stageId } = router.query as any;

  const renderDate = (date) => {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format("MMM D, YYYY")}</ItemDate>;
  };

  return (
    <Wrapper>
      {tasks.map((task) => (
        <ItemWrapper
          key={task._id}
          onClick={() =>
            router.push(`/publicTasks?stageId=${stageId}&itemId=${task._id}`)
          }
        >
          <Content>
            <h5>
              {task.priority && <PriorityIndicator value={task.priority} />}{" "}
              {task.name}
            </h5>
            <p>{task.description}</p>
          </Content>
          <ItemFooter>
            Last updated:
            <Right>{renderDate(task.modifiedAt)}</Right>
          </ItemFooter>
        </ItemWrapper>
      ))}
    </Wrapper>
  );
}

export default ItemContainer;
