import dayjs from "dayjs";
import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
} from "@erxes/ui/src";
import React from "react";
import { useNavigate } from "react-router-dom";
// import AccountFormContainer from "../containers/AccountForm";
import { ITransaction } from "../types";

type Props = {
  transaction: ITransaction;
  isChecked: boolean;
  toggleBulk: (transaction: ITransaction, isChecked?: boolean) => void;
};

const Row: React.FC<Props> = (props) => {
  const { transaction, toggleBulk, isChecked } = props;
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
      toggleBulk(transaction, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  // const content = (props) => <AccountFormContainer {...props} transactionId={transaction._id} />;

  const { date, number, journal, sumDt, sumCt } = transaction;

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{dayjs(date).format('yyyy-MM-dd')}</td>
      <td>{number}</td>
      <td>{sumDt.toLocaleString()}</td>
      <td>{sumCt.toLocaleString()}</td>
      <td>{journal}</td>

      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit transaction"
            trigger={trigger}
            size="xl"
            content={'content'}
            // content={content}
          />
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
