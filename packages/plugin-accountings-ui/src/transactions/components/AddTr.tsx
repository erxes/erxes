import { DropdownList, DropdownNoPadding } from "../../styles";
import { Icon, __ } from "@erxes/ui/src";

import { AppConsumer } from "coreui/appContext";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import { DropdownContent } from "../styles";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import { can } from "@erxes/ui/src/utils";

type Props = {
  onClick: (journal: string) => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const AddTransactionLink = (props: FinalProps) => {
  const { onClick, currentUser } = props;

  return (
    <DropdownNoPadding>
      <Dropdown
        as={DropdownToggle}
        toggleComponent={
          <>
            <Icon icon="add" />
            &nbsp;
            {__("New transaction")}
            <Icon icon="angle-down" />
          </>
        }
      >
        <DropdownList>
          <DropdownContent>
            <div>
              <h3>Ерөнхий</h3>
              {can("accountingsCreateMainTr", currentUser) && (
                <li onClick={onClick.bind(this, "main")}>Ерөнхий журнал</li>
              )}
              <li>НӨАТ</li>
            </div>
            <div>
              <h3>Мөнгөн хөрөнгө</h3>
              <li onClick={onClick.bind(this, "cash")}>Касс</li>
              <li onClick={onClick.bind(this, "bank")}>Харилцах</li>
            </div>
            <div>
              <h3>Тооцоо</h3>
              <li onClick={onClick.bind(this, "receivable")}>Авлага</li>
              <li onClick={onClick.bind(this, "payable")}>Өглөг</li>
            </div>
            <div>
              <h3>Бараа материал</h3>
              <li onClick={onClick.bind(this, "inv_income")}>Орлого</li>
              <li>Хангамжийн зарлага</li>
              <li>Борлуулалт (байнгын)</li>
              <li>Борлуулалт (ажил үйлчилгээ)</li>
              <li>Дотоод хөдөлгөөн</li>
            </div>
            <div>
              <h3>Үндсэн хөрөнгө</h3>
              <li>Орлого</li>
              <li>Акт</li>
              <li>Хөдөлгөөн</li>
              <li>Тохируулга</li>
            </div>
          </DropdownContent>
        </DropdownList>
      </Dropdown>
    </DropdownNoPadding>
  );
};

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => (
      <AddTransactionLink
        {...props}
        currentUser={currentUser || ({} as IUser)}
      />
    )}
  </AppConsumer>
);
