import * as _ from "lodash";

import { Config, ICustomField, IUser, Label } from "../../types";
import React, { useState } from "react";

import Alert from "../../utils/Alert";
import Button from "../../common/Button";
import { ControlLabel } from "../../common/form";
import { DetailHeader } from "../../styles/cards";
import FormControl from "../../common/form/Control";
import FormGroup from "../../common/form/Group";
import { FormWrapper } from "../../styles/main";
import GenerateField from "./GenerateField";
import Icon from "../../common/Icon";
import ProductSection from "./product/ProductSection";

type Props = {
  handleSubmit: (doc) => void;
  currentUser: IUser;
  customFields: any[];
  config: Config;
  departments: string[];
  branches: string[];
  products?: any[];
  labels: Label[];
  type: string;
  closeModal: () => void;
};

export default function Form({
  handleSubmit,
  closeModal,
  customFields,
  departments,
  branches,
  products,
  type,
  labels,
  config
}: Props) {
  const [productsData, setProductsData] = useState([]);
  const [item, setItem] = useState({} as any);
  const [customFieldsData, setCustomFieldsData] = useState<ICustomField[]>([]);

  const handleClick = () => {
    for (const field of customFields) {
      const customField =
        customFieldsData.find(c => c.field === field._id) || ({} as any);

      if (field.isRequired) {
        const alert = customField.value;

        if (!alert) {
          return Alert.error("Please enter or choose a required field");
        }
      }
    }

    handleSubmit({ ...item, customFieldsData, productsData });
  };

  const onCustomFieldsDataChange = ({ _id, value }) => {
    const field = customFieldsData?.find(c => c.field === _id);

    const systemField = customFields.find(
      f => f._id === _id && f.isDefinedByErxes
    );

    if (systemField) {
      return setItem({
        ...item,
        [systemField.field]: value
      });
    }

    for (const f of customFields) {
      const logics = f.logics || [];

      if (!logics.length) {
        continue;
      }

      if (logics.findIndex(l => l.fieldId && l.fieldId.includes(_id)) === -1) {
        continue;
      }

      customFieldsData.forEach(c => {
        if (c.field === f._id) {
          c.value = "";
        }
      });
    }

    if (field) {
      field.value = value;
      setCustomFieldsData(customFieldsData);
    } else {
      setCustomFieldsData([...customFieldsData, { field: _id, value }]);
    }
  };

  function renderControl({ label, name, placeholder, value = "" }) {
    const handleChange = e => {
      setItem({
        ...item,
        [name]: e.target.value
      });
    };

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl
          name={name}
          placeholder={placeholder}
          value={value}
          required={true}
          onChange={handleChange}
        />
      </FormGroup>
    );
  }

  function renderCustomFields() {
    return customFields.map((field: any, index: number) => {
      return (
        <GenerateField
          labels={labels}
          key={index}
          field={field}
          onValueChange={onCustomFieldsDataChange}
          departments={departments}
          branches={branches}
          products={products}
          isEditing={true}
        />
      );
    });
  }

  function renderProductSection() {
    return (
      <ProductSection
        productsData={productsData}
        config={config}
        onChangeProductsData={setProductsData}
      />
    );
  }

  return (
    <>
      <DetailHeader className="d-flex align-items-center">
        <span onClick={() => closeModal()}>
          <Icon icon="leftarrow-3" /> Back
        </span>
      </DetailHeader>
      <FormWrapper>
        <h4>Add a new {type}</h4>
        <div className="content">
          {renderControl({
            name: "subject",
            label: "Subject",
            value: item.subject,
            placeholder: "Enter a subject"
          })}
          {renderControl({
            name: "description",
            label: "Description",
            value: item.description,
            placeholder: "Enter a description"
          })}
          {renderCustomFields()}

          {type === "deal" && renderProductSection()}

          <div className="right">
            <Button
              btnStyle="success"
              onClick={handleClick}
              uppercase={false}
              icon="check-circle"
            >
              Save
            </Button>
          </div>
        </div>
      </FormWrapper>
    </>
  );
}
