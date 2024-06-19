import { AppConsumer } from "coreui/appContext";
import { __, Icon } from "@erxes/ui/src";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import React from "react";
import { can } from "@erxes/ui/src/utils";
import { IUser } from "@erxes/ui/src/auth/types";
import { DropdownList, DropdownNoPadding } from "../../styles";

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
          <h3 className="popover-header">Ерөнхий</h3>
          <div className="dropdown-list">
            {can("accountingsCreateMainTr", currentUser) && (
              <li onClick={onClick.bind(this, "main")}>Ерөнхий журнал</li>
            )}

            <li onClick={onClick.bind(this, "debt")}>Авлага өглөг</li>
            <li>НӨАТ</li>
            <h3 className="popover-header">Мөнгөн хөрөнгө</h3>
            <li onClick={onClick.bind(this, "cash")}>Касс</li>
            <li onClick={onClick.bind(this, "fund")}>Харилцах</li>
            <h3 className="popover-header">Бараа материал</h3>
            <li>Орлого</li>
            <li>Хангамжийн зарлага</li>
            <li>Борлуулалт (байнгын)</li>
            <li>Борлуулалт (ажил үйлчилгээ)</li>
            <li>Дотоод хөдөлгөөн</li>
            <h3 className="popover-header">Үндсэн хөрөнгө</h3>
            <li>Орлого</li>
            <li>Акт</li>
            <li>Хөдөлгөөн</li>
            <li>Тохируулга</li>
          </div>
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
