import dayjs from "dayjs";
import { Link } from 'react-router-dom';
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

  const { _id, date, number, journal, sumDt, sumCt, parentId } = transaction;

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{number}</td>
      <td>{dayjs(date).format('YYYY-MM-DD')}</td>
      <td>{sumDt.toLocaleString()}</td>
      <td>{sumCt.toLocaleString()}</td>
      <td>{journal}</td>

      <td onClick={onClick}>
        <ActionButtons>
          <Link to={`/accountings/transaction/edit/${parentId}?trId=${_id}`}>
            <Button btnStyle="link">
              <Tip text={__('Manage')} placement="top">
                <Icon icon="edit-3" />
              </Tip>
            </Button>
          </Link>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
