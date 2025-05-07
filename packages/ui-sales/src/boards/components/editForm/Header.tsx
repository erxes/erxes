import {
  HeaderContent,
  HeaderContentSmall,
  HeaderRow,
  TitleRow,
} from "../../styles/item";
import React, { useEffect, useState } from "react";

import { ControlLabel } from "@erxes/ui/src/components/form";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IItem } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  amount?: () => React.ReactNode;
};

function Header(props: Props) {
  const { item } = props;

  const [name, setName] = useState(item.name);

  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  const { saveItem, amount } = props;

  const onNameBlur = () => {
    if (item.name !== name) {
      saveItem({ name });
    }
  };

  const onChangeName = (e) => {
    const itemName = (e.target as HTMLInputElement).value;

    setName(itemName);
    localStorage.setItem(`${props.item._id}Name`, itemName);
  };

  const renderScore = () => {
    const { score } = item;

    if (!score) {
      return null;
    }

    return (
      <HeaderContentSmall>
        <ControlLabel>Score</ControlLabel>
        <p>{score.toLocaleString()}</p>
      </HeaderContentSmall>
    );
  };

  return (
    <HeaderRow>
      <HeaderContent>
        <TitleRow>
          <Icon icon="atm-card" />
          <FormControl
            componentclass="textarea"
            value={name}
            required={true}
            onBlur={onNameBlur}
            onChange={onChangeName}
          />
        </TitleRow>
      </HeaderContent>
      {renderScore()}
      {amount && amount()}
    </HeaderRow>
  );
}

export default Header;
