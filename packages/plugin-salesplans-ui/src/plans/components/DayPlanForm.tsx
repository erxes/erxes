import React, { useState } from "react";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import SelectProductCategory from "@erxes/ui-products/src/containers/SelectProductCategory";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import { __, router } from "@erxes/ui/src/utils";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { IDayPlanParams } from "../types";
import {
  Button,
  ControlLabel,
  DateControl,
  Form as CommonForm,
  FormGroup,
} from "@erxes/ui/src/components";
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src/styles/eindex";
import { DateContainer } from "@erxes/ui/src/styles/main";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const DayPlanForm = (props: Props) => {
  const { renderButton, closeModal } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [dayPlanParams, setDayPlanParams] = useState<IDayPlanParams>({
    date: new Date(),
  });

  const generateDoc = (values: { _id?: string }) => {
    const finalValues = values;

    const strVal = moment(dayPlanParams.date).format("YYYY/MM/DD");

    return {
      ...finalValues,
      ...dayPlanParams,
      date: new Date(strVal),
    };
  };

  const onInputChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    setDayPlanParams((prevState) => ({ ...prevState, [name]: value }));
  };

  const onSelectChange = (name, value) => {
    setDayPlanParams((prevState) => ({ ...prevState, [name]: value }));
  };

  const onSelectDate = (value) => {
    setDayPlanParams((prevState) => ({
      ...prevState,
      date: new Date(moment(value).format("YYYY/MM/DD")),
    }));
  };

  const onAfterSave = () => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, {
      ...dayPlanParams,
      date: moment(dayPlanParams.date).format("YYYY/MM/DD"),
    });
    closeModal();
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__(`Year`)}</ControlLabel>
          <DateContainer>
            <DateControl
              name="createdAtFrom"
              placeholder="Choose date"
              value={
                dayPlanParams.date ||
                new Date(moment(new Date()).format("YYYY/MM/DD"))
              }
              onChange={onSelectDate}
            />
          </DateContainer>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="selectedBranchId"
            initialValue={""}
            onSelect={(branchId) => onSelectChange("branchId", branchId)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="selectedDepartmentId"
            initialValue={""}
            onSelect={(departmentId) =>
              onSelectChange("departmentId", departmentId)
            }
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Product Category</ControlLabel>
          <SelectProductCategory
            label="Choose product category"
            name="productCategoryId"
            initialValue={""}
            onSelect={(categoryId) =>
              onSelectChange("productCategoryId", categoryId)
            }
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Or Product</ControlLabel>
          <SelectProducts
            label="Choose product"
            name="productId"
            initialValue={""}
            onSelect={(productId) => onSelectChange("productId", productId)}
            multi={false}
          />
        </FormGroup>
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
            values: generateDoc(values),
            isSubmitted,
            callback: onAfterSave,
            object: dayPlanParams,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default DayPlanForm;
