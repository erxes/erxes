import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Wrapper,
  ItemWrapper,
  Content,
  ItemFooter,
  Right,
  ItemDate,
} from "../../styles/tasks";
import Detail from "../containers/Detail";
import PriorityIndicator from "../../common/PriorityIndicator";

type Props = {
  tasks: any;
};

function ItemContainer({ tasks }: Props) {
  const [taskId, setId] = useState(null);

  const renderDate = (date) => {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format("MMM D, YYYY")}</ItemDate>;
  };

  return (
    <Wrapper>
      {tasks.map((task) => (
        <ItemWrapper key={task._id}>
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

      <Detail
        _id={taskId}
        renderDate={renderDate}
        onClose={() => setId(null)}
      />
    </Wrapper>
  );
}

export default ItemContainer;
