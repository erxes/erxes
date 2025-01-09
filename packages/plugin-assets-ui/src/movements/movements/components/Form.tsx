import {
  BarItems,
  Bulk,
  Button,
  CollapseContent,
  Form as CommonForm,
  DateControl,
  FormControl,
  ModalTrigger,
  SelectTeamMembers,
  Table,
  __
} from "@erxes/ui/src";
import { CommonFormGroup, CommonItemRow } from "../../../common/utils";
import {
  ContainerBox,
  MovementItemContainer,
  MovementTableWrapper
} from "../../../style";
import {
  ContentColumn,
  ItemRow,
  ItemText
} from "@erxes/ui-sales/src/deals/styles";
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter
} from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { IMovementItem, IMovementType } from "../../../common/types";
import React, { useEffect, useState } from "react";

import AssetChooser from "../containers/Chooser";
import MovementItems from "./MovementItem";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import _loadash from "lodash";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import { queries } from "../graphql";

type Props = {
  detail: IMovementType;
  assetId?: string;
  closeModal: () => void;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
};

type General = {
  branchId?: string;
  departmentId?: string;
  customerId?: string;
  companyId?: string;
  teamMemberId?: string;
};

const Form = (props: Props) => {
  const { closeModal, renderButton, detail, assetId } = props;

  const [variables, setVariables] = useState<IMovementItem[]>([]);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [movedAt, setMovedAt] = useState<string>("");
  const [selectedItemsIds, setSelectedItemsIds] = useState<string[]>([]);
  const [general, setGeneral] = useState<General>({});
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    if (detail) {
      setVariables(detail.items || []);
      setDescription(detail.description || "");
      setMovedAt(detail.movedAt || "");
      setSelectedItemsIds(
        detail?.items && detail.items.map(item => item.assetId)
      );
    }

    if (assetId) {
      setCurrentItems([assetId]);
    }
  }, []);

  const generateDoc = () => {
    const items = variables.map(
      ({
        assetId,
        branchId,
        departmentId,
        customerId,
        companyId,
        teamMemberId
      }) => ({
        assetId,
        branchId,
        departmentId,
        customerId,
        companyId,
        teamMemberId
      })
    );
    const doc = { items, description, movedAt };
    if (!_loadash.isEmpty(detail)) {
      return { _id: detail._id, doc };
    }
    return { ...doc };
  };

  const assetChooser = props => {
    const handleSelect = datas => {
      const newSelectedItemsIds = datas.map(data => data._id);
      client
        .query({
          query: gql(queries.itemsCurrentLocation),
          fetchPolicy: "network-only",
          variables: { assetIds: newSelectedItemsIds }
        })
        .then(res => {
          const { currentAssetMovementItems } = res.data;
          setSelectedItemsIds(newSelectedItemsIds);

          const selectedItems = datas.map(data => ({
            assetId: data._id,
            assetDetail: {
              _id: data._id,
              name: data.name
            }
          }));

          const newVariables = selectedItems.map(selectedItem => {
            const newItem = currentAssetMovementItems.find(
              item => item.assetId === selectedItem.assetId
            );
            if (newItem) {
              return newItem;
            }
            return selectedItem;
          });

          setVariables(newVariables);
        });
    };

    const updatedProps = {
      ...props,
      handleSelect,
      selectedAssetIds: selectedItemsIds
    };

    return <AssetChooser {...updatedProps} />;
  };

  const renderChooser = trigger => {
    const chooserTrigger = trigger ? trigger : <Button>Select Assets</Button>;

    return (
      <ModalTrigger
        title="Select Assets"
        content={assetChooser}
        trigger={chooserTrigger}
        size="lg"
      />
    );
  };

  const renderInfoSelection = (label, asset, value) => {
    let Selection;
    let field;
    let text = "";

    if (label === "Branches") {
      Selection = SelectBranches;
      field = "branchId";
      text = asset?.branch?.title;
    }
    if (label === "Departments") {
      Selection = SelectDepartments;
      field = "departmentId";
      text = asset?.department?.title;
    }
    if (label === "Team Member") {
      Selection = SelectTeamMembers;
      field = "teamMemberId";
      text = asset?.teamMember?.email;
    }
    if (label === "Company") {
      Selection = SelectCompanies;
      field = "companyId";
    }
    if (label === "Customer") {
      Selection = SelectCustomers;
      field = "customerId";
      text = asset?.customer?.primaryEmail;
    }

    const handleChange = selected => {
      const newVariables = variables.map(item =>
        item.assetId === asset.assetId
          ? { ...item, [field]: selected === "" ? null : selected }
          : item
      );
      setVariables(newVariables);
    };

    return (
      <ItemRow key={label} className="item">
        <ItemText>{label}</ItemText>
        <ContentColumn flex="3">
          <MovementItemContainer>
            <Selection
              label={`Choose ${label}`}
              onSelect={handleChange}
              initialValue={value || ""}
              multi={false}
              customOption={{ value: "", label: `Choose ${label}` }}
            />
          </MovementItemContainer>
        </ContentColumn>
      </ItemRow>
    );
  };

  const changeCurrentItem = (id: string) => {
    if (currentItems.includes(id)) {
      const newCurrentItems = currentItems.filter(item => item !== id);
      return setCurrentItems(newCurrentItems);
    }

    setCurrentItems(prevCurrentItems => [...prevCurrentItems, id]);
  };

  const handleGeneralDate = e => {
    setMovedAt(e);
  };

  const handleGeneralDescription = e => {
    const { value } = e.currentTarget as HTMLInputElement;

    setDescription(value);
  };

  const handleChangeRowItem = (prevItemId, newItem) => {
    const newVariables = variables.map(item =>
      item.assetId === prevItemId ? newItem : item
    );
    const removedSeletedItemIds = selectedItemsIds.filter(
      item => item !== prevItemId
    );

    setVariables(newVariables);
    setSelectedItemsIds([...removedSeletedItemIds, newItem.assetId]);
  };

  const renderGeneral = () => {
    const handleGeneralOptions = (value, field) => {
      setCurrentItems([]);

      const newVariables = variables.map(item =>
        checkedItems.includes(item.assetId)
          ? { ...item, [field]: value === "" ? null : value }
          : item
      );

      setVariables(newVariables);
      setGeneral(prevGeneral => ({
        ...prevGeneral,
        [field]: value === "" ? null : value
      }));
    };

    return (
      <CollapseContent
        title="General Location Configrations"
        description={__(
          "If you want to change the location generally of your selected assets, you should click checkboxes below."
        )}
      >
        <BarItems>
          <ContentColumn>
            <FormWrapper>
              <FormColumn>
                <CommonItemRow label="Branch">
                  <SelectBranches
                    label="Choose Branch"
                    name="branchId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.branchId}
                    customOption={{ value: "", label: "Choose Branch" }}
                  />
                </CommonItemRow>
              </FormColumn>
              <FormColumn>
                <CommonItemRow label="Department">
                  <SelectDepartments
                    label="Choose Department"
                    name="departmentId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.departmentId}
                    customOption={{ value: "", label: "Choose Department" }}
                  />
                </CommonItemRow>
              </FormColumn>
            </FormWrapper>
            <FormWrapper>
              <FormColumn>
                <CommonItemRow label="Customer">
                  <SelectCustomers
                    label="Choose Customer"
                    name="customerId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.customerId}
                    customOption={{ value: "", label: "Choose Customer" }}
                  />
                </CommonItemRow>
              </FormColumn>
              <FormColumn>
                <CommonItemRow label="Company">
                  <SelectCompanies
                    label="Choose Company"
                    name="companyId"
                    onSelect={handleGeneralOptions}
                    multi={false}
                    initialValue={general?.companyId}
                    customOption={{ value: "", label: "Choose Company" }}
                  />
                </CommonItemRow>
              </FormColumn>
            </FormWrapper>
            <CommonItemRow label="Team Member">
              <SelectTeamMembers
                label="Choose Team Member"
                name="teamMemberId"
                onSelect={handleGeneralOptions}
                multi={false}
                initialValue={general?.teamMemberId}
                customOption={{ value: "", label: "Choose Team Member" }}
              />
            </CommonItemRow>
          </ContentColumn>
        </BarItems>
      </CollapseContent>
    );
  };

  const renderRow = () => {
    const removeRow = id => {
      const newVariables = variables.filter(item => item.assetId !== id);
      const newSelectedItems = selectedItemsIds.filter(itemId => itemId !== id);
      if (currentItems.includes(id)) {
        const newCurrentItems = currentItems.filter(item => item !== id);
        setCurrentItems(newCurrentItems);
      }

      setVariables(newVariables);
      setSelectedItemsIds(newSelectedItems);
    };
    const onChangeCheckedItems = (id: string) => {
      if (checkedItems.includes(id)) {
        return setCheckedItems(checkedItems.filter(item => item !== id));
      }
      return setCheckedItems([...checkedItems, id]);
    };

    return variables.map(item => (
      <MovementItems
        key={item.assetId}
        item={item}
        current={currentItems.includes(item.assetId) ? item.assetId : ""}
        changeCurrent={changeCurrentItem}
        removeRow={removeRow}
        selectedItems={selectedItemsIds}
        isChecked={checkedItems.includes(item.assetId)}
        onChangeBulkItems={onChangeCheckedItems}
        handleChangeRowItem={handleChangeRowItem}
      >
        {renderInfoSelection("Branches", item, item["branchId"])}
        {renderInfoSelection("Departments", item, item["departmentId"])}
        {renderInfoSelection("Customer", item, item["customerId"])}
        {renderInfoSelection("Company", item, item["companyId"])}
        {renderInfoSelection("Team Member", item, item["teamMemberId"])}
      </MovementItems>
    ));
  };

  const renderList = () => {
    const onChange = () => {
      const newCheckedItems = variables.map(item => item.assetId);

      setCheckedItems(checkedItems.length > 0 ? [] : newCheckedItems);
    };

    return (
      <MovementTableWrapper>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <FormControl
                  checked={
                    variables.length > 0 &&
                    variables.length === checkedItems.length
                  }
                  componentclass="checkbox"
                  onChange={onChange}
                  color="#3B85F4"
                />
              </th>
              <th>{__("Name")}</th>
              <th>{__("Branch")}</th>
              <th>{__("Departmnet")}</th>
              <th>{__("Customer")}</th>
              <th>{__("Comapny")}</th>
              <th>{__("Team Member")}</th>
            </tr>
          </thead>
          <tbody>{renderRow()}</tbody>
        </Table>
      </MovementTableWrapper>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;

    return (
      <ContainerBox $column gap={20}>
        <FormWrapper>
          <FormColumn>
            <CommonFormGroup label="Date">
              <DateContainer>
                <DateControl
                  placeholder="Select Date"
                  onChange={handleGeneralDate}
                  value={movedAt}
                />
              </DateContainer>
            </CommonFormGroup>
          </FormColumn>
          <FormColumn>
            <CommonFormGroup label="Description">
              <FormControl
                type="text"
                name="description"
                onChange={handleGeneralDescription}
                value={description}
                required
              />
            </CommonFormGroup>
          </FormColumn>
        </FormWrapper>

        {variables.length > 0 && renderGeneral()}
        {renderList()}

        <ContainerBox $justifyCenter={true}>
          {renderChooser(<Button icon="plus-circle">{__("Add Asset")}</Button>)}
        </ContainerBox>
        {renderButton && (
          <ModalFooter>
            <Button btnStyle="simple" onClick={() => closeModal()}>
              Cancel
            </Button>
            {renderButton({
              text: "Movement",
              values: generateDoc(),
              isSubmitted,
              callback: closeModal,
              object: !_loadash.isEmpty(detail)
            })}
          </ModalFooter>
        )}
      </ContainerBox>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
