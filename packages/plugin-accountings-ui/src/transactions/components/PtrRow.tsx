import dayjs from "dayjs";
import { Link } from 'react-router-dom';
import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  Tip,
  __,
} from "@erxes/ui/src";
import React from "react";
import { ITransaction } from "../types";

type Props = {
  transaction: ITransaction;
  isChecked: boolean;
  toggleBulk: (transaction: ITransaction, isChecked?: boolean) => void;
  toggleHalf: (id: string, type: string, isChecked?: boolean) => void;
  hasNewParent: boolean;
  hasNewPtr: boolean;
};

const Row: React.FC<Props> = (props) => {
  const { transaction, toggleBulk, toggleHalf, isChecked, hasNewParent, hasNewPtr } = props;

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(transaction, e.target.checked);
    }
  };

  const onChangeParent = (e) => {
    if (toggleHalf) {
      toggleHalf(transaction.parentId || '', 'parent', e.target.checked);
    }
  };

  const onChangePtr = (e) => {
    if (toggleHalf) {
      toggleHalf(transaction.ptrId || '', 'ptr', e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const { _id, date, number, journal, sumDt, sumCt, parentId, description, branch, department, ptrStatus, details } = transaction;
  const accountStr = details.length && `${details[0].account?.code} - ${details[0].account?.name}` || '';

  return (
    <>
      {hasNewParent && (
        <tr>
          <td onClick={onClick} style={{ "padding-left": '15px' }} >
            <FormControl
              checked={false}
              componentclass="checkbox"
              onChange={onChangeParent}
            />
          </td>
          <td>parent</td>
        </tr>
      ) || (<></>)}
      {hasNewPtr && (
        <tr>
          <td onClick={onClick} style={{ "padding-left": '30px' }} >
            <FormControl
              checked={false}
              componentclass="checkbox"
              onChange={onChangePtr}
            />
          </td>
          <td>ptr</td>
        </tr>
      ) || (<></>)}
      <tr>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentclass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{accountStr}</td>
        <td>{number}</td>
        <td>{dayjs(date).format('YYYY-MM-DD')}</td>
        <td>{description}</td>
        <td>{sumDt.toLocaleString()}</td>
        <td>{sumCt.toLocaleString()}</td>
        <td>{branch?.title}</td>
        <td>{department?.title}</td>
        <td>{journal}</td>
        <td>{ptrStatus}</td>

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
    </>
  );
};

export default Row;
