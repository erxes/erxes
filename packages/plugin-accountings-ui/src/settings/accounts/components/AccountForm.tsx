import { Row } from '@erxes/ui-inbox/src/settings/integrations/styles';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import CommonForm from "@erxes/ui/src/components/form/Form";
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import {
  IButtonMutateProps,
  IFormProps,
} from "@erxes/ui/src/types";
import { __, router } from "@erxes/ui/src/utils/core";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SelectAccountCategory from '../containers/SelectAccountCategory';
import { IAccount, IAccountCategory } from '../types';

interface IProps {
  account?: IAccount;
  accountCategories: IAccountCategory[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
}

type State = {
  code: string;
  name: string;
  categoryId?: string;
  parentId?: string;
  currency: string;
  kind: string;
  journal: string;
  description?: string;
  branchId?: string;
  departmentId?: string;
  scopeBrandIds?: string[];
  status: string;
  isOutBalance: boolean;
  category?: IAccountCategory;
  maskStr?: string;
};

function AccountForm(props: IProps): React.ReactNode {
  const location = useLocation();
  const account = props.account || ({} as IAccount);

  const {
    code,
    name,
    categoryId,
    parentId,
    currency,
    kind,
    journal,
    description,
    branchId,
    departmentId,
    scopeBrandIds,
    status,
    isOutBalance,
  } = account;

  const paramCategoryId = router.getParam(location, "categoryId");

  const [state, setState] = useState<State>({
    ...account,
    code: code ?? '',
    name: name ?? '',
    categoryId: categoryId || paramCategoryId || '',
    parentId: parentId ?? '',
    currency: currency ?? 'MNT',
    kind: kind ?? '',
    journal: journal ?? '',
    description: description ?? '',
    branchId: branchId ?? '',
    departmentId: departmentId ?? '',
    scopeBrandIds: scopeBrandIds || [],
    status: status ?? '',
    isOutBalance: isOutBalance ?? false,
  });

  const getMaskStr = (categoryId) => {
    const { code } = state;

    const category = props.accountCategories.find((pc) => pc._id === categoryId);
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

  const generateDoc = (values: {
    _id?: string;
    description: string;
  }) => {
    const { account } = props;
    const finalValues = values;
    if (account) {
      finalValues._id = account._id;
    }

    return {
      ...account,
      ...state,
      ...finalValues,
    };
  };

  const onCategoryChange = (categoryId: string) => {
    const category = getMaskStr(categoryId)
    setState((prevState) => ({ ...prevState, categoryId, category }));
  }

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, account } =
      props;
    const { values, isSubmitted } = formProps;
    const object = account || ({} as IAccount);

    const {
      code,
      name,
      categoryId,
      parentId,
      currency,
      kind,
      journal,
      description,
      branchId,
      departmentId,
      scopeBrandIds,
      status,
      isOutBalance,
      maskStr,
    } = state;

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
                    value: '',
                    label: '...Empty category',
                  }}
                  onSelect={(categoryId) => onCategoryChange(categoryId as string)}
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
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>

          </FormColumn>
          <FormColumn>

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
};

export default AccountForm;
