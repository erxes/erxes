import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
} from "@erxes/ui/src";

import { IAccount } from "../types";
import ProductForm from "../containers/AccountForm";
import React from "react";
import TextInfo from "@erxes/ui/src/components/TextInfo";
import { useNavigate } from "react-router-dom";

type Props = {
  account: IAccount;
  isChecked: boolean;
  toggleBulk: (account: IAccount, isChecked?: boolean) => void;
};

const Row: React.FC<Props> = (props) => {
  const { account, toggleBulk, isChecked } = props;
  const navigate = useNavigate();

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

  const onTrClick = () => {
    navigate(`/settings/account-service/details/${account._id}`);
  };

  const content = (props) => <ProductForm {...props} account={account} />;

  const { code, name } = account;

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      
      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit basic info"
            trigger={trigger}
            size="xl"
            content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
