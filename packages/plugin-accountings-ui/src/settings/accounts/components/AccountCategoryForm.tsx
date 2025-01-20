import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";
import { __, router } from "@erxes/ui/src/utils/core";

import Button from "@erxes/ui/src/components/Button";
import CommonForm from "@erxes/ui/src/components/form/Form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IAccountCategory } from "../types";
import { Row } from "@erxes/ui-inbox/src/settings/integrations/styles";
import SelectAccountCategory from "../containers/SelectAccountCategory";
import { useLocation } from "react-router-dom";

interface IProps {
  accountCategory?: IAccountCategory;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  accountCategories: IAccountCategory[];
  closeModal: () => void;
}

type State = {
  name: string;
  code: string;
  order: string;
  scopeBrandIds: string[];
  description: string;
  parentId: string;
  status: string;
  maskType: string;
  mask: any;
  parent?: IAccountCategory;
  maskStr?: string;
};

function AccountCategoryForm(props: IProps): React.ReactNode {
  const location = useLocation();
  const accountCategory = props.accountCategory || ({} as IAccountCategory);

  const {
    name,
    code,
    order,
    scopeBrandIds,
    description,
    parentId,
    status,
    maskType,
    mask,
  } = accountCategory;

  const paramCategoryId = router.getParam(location, "categoryId");

  const [state, setState] = useState<State>({
    ...accountCategory,
    name: name || "",
    code: code || "",
    order: order || "",
    scopeBrandIds: scopeBrandIds || [],
    description: description || "",
    parentId: parentId || paramCategoryId || "",
    status: status || "",
    maskType: maskType || "",
    mask: mask || "",
  });

  const generateDoc = (values: { _id?: string; description: string }) => {
    const { accountCategory, accountCategories } = props;
    const finalValues = values;
    if (accountCategory) {
      finalValues._id = accountCategory._id;
    }

    let genMaskType = maskType;
    let genMask = maskType && mask;

    const parentCategory = accountCategories.find((c) => c._id === parentId);
    if (parentCategory && parentCategory.maskType === "hard") {
      genMaskType = parentCategory.maskType;
      genMask = parentCategory.mask;
    }

    if (parentCategory && parentCategory.maskType === "soft") {
      if (mask.isSimilar) {
        genMaskType = parentCategory.maskType;
        genMask = parentCategory.mask;
      }
    }

    return {
      ...accountCategory,
      ...state,
      ...finalValues,
      status: "active",
      maskType: genMaskType,
      mask: genMask,
    };
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal, accountCategory } = props;
    const { values, isSubmitted } = formProps;

    const { code, name, parentId, maskStr } = state;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Parent Category</ControlLabel>
              <Row>
                <SelectAccountCategory
                  label="Choose product category"
                  name="productCategoryId"
                  initialValue={parentId}
                  customOption={{
                    value: "",
                    label: "...Empty category",
                  }}
                  onSelect={(categoryId) =>
                    setState((prevState) => ({
                      ...prevState,
                      categoryId: categoryId as string,
                    }))
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
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={name}
                autoFocus={true}
                required={true}
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
            object: accountCategory,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
}

export default AccountCategoryForm;
