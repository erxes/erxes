import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
} from "@erxes/ui/src";

import AccountFormContainer from "../containers/AccountForm";
import { IAccount } from "../types";
import React from "react";

type Props = {
  account: IAccount;
  isChecked: boolean;
  toggleBulk: (account: IAccount, isChecked?: boolean) => void;
};

const Row: React.FC<Props> = (props) => {
  const { account, toggleBulk, isChecked } = props;

  const trigger = (
    <Button btnStyle="link">
      <Tip text={__("Edit")} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(account, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const content = (props) => (
    <AccountFormContainer {...props} accountId={account._id} />
  );

  const { code, name, category, currency, kind, journal } = account;

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      <td>{category?.name}</td>
      <td>{currency}</td>
      <td>{kind}</td>
      <td>{journal}</td>

      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit account"
            trigger={trigger}
            size="lg"
            content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
