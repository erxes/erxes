import Icon from "../../../common/Icon";
import React from "react";

type Props = {
  totalCount?: number;
  handleHearted: () => void;
  emojiIsReacted?: boolean;
};

function List({ totalCount, handleHearted, emojiIsReacted }: Props) {
  return (
    <b onClick={() => handleHearted()}>
      <Icon color={`${emojiIsReacted && "red"}`} icon="heart-2" /> {totalCount}
    </b>
  );
}

export default List;
