import { ACCOUNT_JOURNALS, ACCOUNT_KINDS } from "../../../constants";
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import { IAccount, IAccountCategory } from "../types";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils/core";

import Button from "@erxes/ui/src/components/Button";
import CommonForm from "@erxes/ui/src/components/form/Form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { Row } from "@erxes/ui-inbox/src/settings/integrations/styles";
import SelectAccountCategory from "../containers/SelectAccountCategory";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import { useLocation } from "react-router-dom";

interface IProps {
  account?: IAccount;
  accountCategories: IAccountCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  currencies: string[];
}

type State = {
  code: string;
  categoryId?: string;
  parentId?: string;
  branchId?: string;
  departmentId?: string;
  scopeBrandIds?: string[];
  status: string;
  isTemp?: boolean;
  isOutBalance: boolean;
  category?: IAccountCategory;
  maskStr?: string;
};

function AccountForm(props: IProps): React.ReactNode {
  const location = useLocation();
  const account = props.account || ({} as IAccount);

  const {
    code,
    categoryId,
    parentId,
    branchId,
    departmentId,
    scopeBrandIds,
    status,
    isTemp,
    isOutBalance,
  } = account;

  const paramCategoryId = router.getParam(location, "categoryId");

  const [state, setState] = useState<State>({
    ...account,
    code: code ?? "",
    categoryId: categoryId || paramCategoryId || "",
    parentId: parentId ?? "",
    branchId: branchId ?? "",
    departmentId: departmentId ?? "",
    scopeBrandIds: scopeBrandIds || [],
    status: status ?? "",
    isTemp: isTemp ?? false,
    isOutBalance: isOutBalance ?? false,
  });

  const getMaskStr = (categoryId) => {
    const { code } = state;

    const category = props.accountCategories.find(
      (pc) => pc._id === categoryId
    );
    let maskStr = "";

    if (category && category.maskType && category.mask) {
      const maskList: any[] = [];
      for (const value of category.mask.values || []) {
        if (value.static) {
          maskList.push(value.static);
          continue;
        }

        if (value.type === "char") {
          maskList.push(value.char);
        }

        if (value.type === "customField" && value.matches) {
          maskList.push(`(${Object.values(value.matches).join("|")})`);
        }
      }
      maskStr = `${maskList.join("")}\w+`;

      if (maskList.length && !code) {
        setState((prevState) => ({ ...prevState, code: maskList[0] }));
      }
    }
    setState((prevState) => ({ ...prevState, maskStr }));

    return category;
  };

  const generateDoc = (values: { _id?: string }) => {
    const { account } = props;
    const finalValues = values;
    if (account) {
      finalValues._id = account._id;
    }

    return {
      ...account,
      ...state,
      ...finalValues,
      isTemp: Boolean(state.isTemp),
      isOutBalance: Boolean(state.isOutBalance),
    };
  };

  const onCategoryChange = (categoryId: string) => {
    const category = getMaskStr(categoryId);
    setState((prevState) => ({ ...prevState, categoryId, category }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, account, currencies } = props;
    const { values, isSubmitted } = formProps;
    const object = account || ({} as IAccount);

    const { code, categoryId, branchId, departmentId, maskStr, isOutBalance, isTemp } =
      state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Category</ControlLabel>
              <Row>
                <SelectAccountCategory
                  label="Choose product category"
                  name="productCategoryId"
                  initialValue={categoryId}
                  customOption={{
                    value: "",
                    label: "...Empty category",
                  }}
                  onSelect={(categoryId) =>
                    onCategoryChange(categoryId as string)
                  }
                  multi={false}
                />
              </Row>
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Code</ControlLabel>
              <p>
                Depending on your business type, you may type in a barcode or
                any other UPC (Universal Product Code). If you don't use UPC,
                type in any numeric value to differentiate your accounts. With
                pattern {maskStr}
              </p>
              <FormControl
                {...formProps}
                name="code"
                value={code}
                required={true}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    code: e.target.value.replace(/\*/g, ""),
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>{__("Name")}</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Description")}</ControlLabel>
              <FormControl
                {...formProps}
                name="description"
                defaultValue={object.description}
                componentclass="textarea"
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>{__("Currency")}</ControlLabel>
              <FormControl
                {...formProps}
                componentclass="select"
                name="currency"
                defaultValue={object.currency || "MNT"}
                options={currencies.map((cur) => ({ value: cur, label: cur }))}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Kind")}</ControlLabel>
              <FormControl
                {...formProps}
                componentclass="select"
                name="kind"
                defaultValue={object.kind}
                options={ACCOUNT_KINDS}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Journal")}</ControlLabel>
              <FormControl
                {...formProps}
                componentclass="select"
                name="journal"
                defaultValue={object.journal}
                options={ACCOUNT_JOURNALS}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Branch")}</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="branchId"
                initialValue={branchId}
                multi={false}
                onSelect={(branchId) => {
                  setState((prevState) => ({
                    ...prevState,
                    branchId: branchId as string,
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Department")}</ControlLabel>
              <SelectDepartments
                label="Choose department"
                name="departmentId"
                initialValue={departmentId}
                multi={false}
                onSelect={(departmentId) => {
                  setState((prevState) => ({
                    ...prevState,
                    departmentId: departmentId as string,
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Is Temp")}</ControlLabel>
              <FormControl
                {...formProps}
                componentclass="checkbox"
                name="isTemp"
                defaultValue={isTemp}
                checked={isTemp}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    isTemp: e.target.checked,
                  }));
                }}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__("Out of Balance")}</ControlLabel>
              <FormControl
                {...formProps}
                componentclass="checkbox"
                name="isOutBalance"
                defaultValue={isOutBalance}
                checked={isOutBalance}
                onChange={(e: any) => {
                  setState((prevState) => ({
                    ...prevState,
                    isOutBalance: e.target.checked,
                  }));
                }}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: "account and service",
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: account,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
}

export default AccountForm;
