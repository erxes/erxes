import { JOURNALS_KEY_LABELS, LEASE_TYPES } from "../constants";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import Chooser from "@erxes/ui/src/components/Chooser";
import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import { CollateralButton } from "../../contracts/styles";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IContractConfig, IContractTypeDetail } from "../types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import ProductChooser from "@erxes/ui-products/src/containers/ProductChooser";
import { ScrollWrapper } from "@erxes/ui/src/styles/main";
import { MainStyleTitle as Title } from "@erxes/ui/src/styles/eindex";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import dimensions from "@erxes/ui/src/styles/dimensions";
import styled from "styled-components";
import SelectProducts from "@erxes/ui-products/src/containers/SelectProducts";
import BoardSelectContainer from '@erxes/ui-sales/src/boards/containers/BoardSelect';

export const DISTRICTS = [
  { value: "Архангай", label: "Архангай" },
  { value: "Баян-Өлгий", label: "Баян-Өлгий" },
  { value: "Баянхонгор", label: "Баянхонгор" },
  { value: "Булган", label: "Булган" },
  { value: "Говь-Алтай", label: "Говь-Алтай" },
  { value: "Дорноговь", label: "Дорноговь" },
  { value: "Дорнод", label: "Дорнод" },
  { value: "Дундговь", label: "Дундговь" },
  { value: "Завхан", label: "Завхан" },
  { value: "Өвөрхангай", label: "Өвөрхангай" },
  { value: "Өмнөговь", label: "Өмнөговь" },
  { value: "Сүхбаатар аймаг", label: "Сүхбаатар аймаг" },
  { value: "Сэлэнгэ", label: "Сэлэнгэ" },
  { value: "Төв", label: "Төв" },
  { value: "Увс", label: "Увс" },
  { value: "Ховд", label: "Ховд" },
  { value: "Хөвсгөл", label: "Хөвсгөл" },
  { value: "Хэнтий", label: "Хэнтий" },
  { value: "Дархан-Уул", label: "Дархан-Уул" },
  { value: "Орхон", label: "Орхон" },
  { value: "Говьсүмбэр", label: "Говьсүмбэр" },
  { value: "Хан-Уул", label: "Хан-Уул" },
  { value: "Баянзүрх", label: "Баянзүрх" },
  { value: "Сүхбаатар", label: "Сүхбаатар" },
  { value: "Баянгол", label: "Баянгол" },
  { value: "Багануур", label: "Багануур" },
  { value: "Багахангай", label: "Багахангай" },
  { value: "Налайх", label: "Налайх" },
  { value: "Сонгинохайрхан", label: "Сонгинохайрхан" },
  { value: "Чингэлтэй", label: "Чингэлтэй" },
];

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  background: white;
`;

interface IContractConfigMap extends IContractConfig {
  requirementsTxt?: string;
  customerDocumentsTxt?: string;
  companyDocumentsTxt?: string;
}

type Props = {
  contractType: IContractTypeDetail;
  saveItem: (doc: IContractTypeDetail, callback?: (item) => void) => void;
};

const GeneralSettings = (props: Props) => {
  const [currentMap, setCurrentMap] = useState({
    ...props.contractType.config || {} as IContractConfigMap,
    requirementsTxt: props.contractType.config?.requirements?.join('\n'),
    customerDocumentsTxt: props.contractType.config?.customerDocuments?.join('\n'),
    companyDocumentsTxt: props.contractType.config?.companyDocuments?.join('\n'),
  });
  const [state, setState] = useState(props.contractType)
  const { contractType } = props;

  const save = (e) => {
    e.preventDefault();

    props.saveItem({
      ...contractType, ...state, config: {
        ...currentMap,
        requirements: currentMap.requirementsTxt?.split('\n'),
        customerDocuments: currentMap.customerDocumentsTxt?.split('\n'),
        companyDocuments: currentMap.companyDocumentsTxt?.split('\n'),
      }
    });
  };

  const onChangeConfig = (code: string, value) => {
    setCurrentMap({ ...(currentMap || {}), [code]: value });
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeCheckbox = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  const renderItem = (
    key: string,
    description?: string,
    controlProps?: any
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          {...controlProps}
          value={currentMap[key]}
          onChange={onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  const renderCheckbox = (
    key: string,
    description?: string,
    backElement?: any
  ) => {
    return (
      <FormGroup>
        {backElement && (
          <div style={{ display: "inline-block", marginRight: "5px" }}>
            {backElement}
          </div>
        )}
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={currentMap[key]}
          onChange={onChangeCheckbox.bind(this, key)}
          componentclass="checkbox"
        />
      </FormGroup>
    );
  };

  const renderProductTrigger = (collateral?: any) => {
    let content = (
      <div>
        {__("Choose E-Barimt Product")} <Icon icon="plus-circle" />
      </div>
    );

    // if collateral selected
    if (collateral) {
      content = (
        <div>
          {collateral.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <CollateralButton>{content}</CollateralButton>;
  };

  const renderProductModal = (key: string) => {
    const product = currentMap[key];

    const productOnChange = (products: any[]) => {
      const product = products && products.length === 1 ? products[0] : null;

      if (product) {
        onChangeConfig(key, product);
      }
    };

    const content = (props) => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        data={{
          name: "Product",
          products: product ? [product] : [],
        }}
        limit={1}
        chooserComponent={Chooser}
      />
    );

    return (
      <ModalTrigger
        title="Choose product"
        trigger={renderProductTrigger(product)}
        size="lg"
        content={content}
      />
    );
  };

  const actionButtons = (
    <Button
      btnStyle="primary"
      onClick={save}
      icon="check-circle"
      uppercase={false}
    >
      {__("Save")}
    </Button>
  );

  const content = (
    <ScrollWrapper>
      <ContentBox>
        <CollapseContent title={__("Loan payment")}>
          {renderItem("transAccount")}
          {renderItem("normalAccount")}
          {renderItem("expiredAccount")}
          {renderItem("doubtfulAccount")}
          {renderItem("negativeAccount")}
          {renderItem("badAccount")}
          {renderCheckbox("amountHasEBarimt")}
        </CollapseContent>

        <CollapseContent title={__("Interest")}>
          {renderItem("interestAccount")}
          {renderCheckbox("interestHasEBarimt")}
        </CollapseContent>

        <CollapseContent title={__("Insurance")}>
          {renderItem("insuranceAccount")}
        </CollapseContent>

        <CollapseContent title={__("Loss")}>
          {renderItem("lossAccount")}
          {renderCheckbox("lossHasEBarimt")}
        </CollapseContent>

        <CollapseContent title={__("Other")}>
          {renderItem("debtAccount")}
          {renderItem("otherReceivable")}
          {renderItem("feeIncomeAccount")}
        </CollapseContent>

        <CollapseContent title={__("EBarimt")}>
          {renderItem("eBarimtAccount")}
          {renderCheckbox("isAutoSendEBarimt")}
          {renderCheckbox("isHasVat")}
          <FormGroup>
            <ControlLabel>{__("Provice/District")}</ControlLabel>
            <FormControl
              componentclass="select"
              defaultValue={currentMap.districtName}
              options={DISTRICTS}
              onChange={onChangeInput.bind(this, "districtName")}
              required={true}
            />
          </FormGroup>
          {renderItem("organizationRegister")}
          {renderItem("defaultGSCode")}
          <div
            style={{
              boxShadow: "1px 0px 5px rgba(0,0,0,0.1)",
              padding: 20,
              paddingBottom: 10,
              borderRadius: 10,
            }}
          >
            {renderCheckbox("isAmountUseEBarimt")}
            {currentMap?.isAmountUseEBarimt && (
              <FormGroup>
                <ControlLabel>{__("Product")}</ControlLabel>
                {renderProductModal("amountEBarimtProduct")}
              </FormGroup>
            )}
          </div>
          <div
            style={{
              boxShadow: "1px 0px 5px rgba(0,0,0,0.1)",
              padding: 20,
              paddingBottom: 10,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            {renderCheckbox("isLossUseEBarimt")}
            {currentMap?.isLossUseEBarimt && (
              <FormGroup>
                <ControlLabel>{__("Product")}</ControlLabel>
                {renderProductModal("lossEBarimtProduct")}
              </FormGroup>
            )}
          </div>
        </CollapseContent>

        <CollapseContent title={__("Classification")}>
          {renderItem("normalExpirationDay", "Normal /Expiration Day/", {
            type: "number",
          })}
          {renderItem("expiredExpirationDay", "Expired /Expiration Day/", {
            type: "number",
          })}
          {renderItem("doubtExpirationDay", "Doubt /Expiration Day/", {
            type: "number",
          })}
          {renderItem("negativeExpirationDay", "Negative /Expiration Day/", {
            type: "number",
          })}
          {renderItem("badExpirationDay", "Bad /Expiration Day/", {
            type: "number",
          })}
        </CollapseContent>

        <CollapseContent title={__("Range config")}>
          {renderItem("minInterest", `Min interest (month: ${((currentMap.minInterest ?? 0) / 12).toLocaleString()})`, {
            type: "number",
          })}
          {renderItem("maxInterest", `Max  interest (month: ${((currentMap.maxInterest ?? 0) / 12).toLocaleString()})`, {
            type: "number",
          })}
          {renderItem("minTenor", "Min tenor /Month/", {
            type: "number",
          })}
          {renderItem("maxTenor", "Max tenor /Month/", {
            type: "number",
          })}
          {renderItem("minAmount", "Min amount", {
            type: "number",
            useNumberFormat: true,
          })}
          {renderItem("maxAmount", "Max amount", {
            type: "number",
            useNumberFormat: true,
          })}
          {props.contractType?.leaseType === LEASE_TYPES.LINEAR &&
            renderItem("minCommitmentInterest", "Min Commitment Interest", {
              type: "number",
              useNumberFormat: true,
            })}
          {props.contractType?.leaseType === LEASE_TYPES.LINEAR &&
            renderItem("maxCommitmentInterest", "Max Commitment Interest", {
              type: "number",
              useNumberFormat: true,
            })}
        </CollapseContent>

        <CollapseContent title={__("Internet bank")}>
          <FormGroup>
            <ControlLabel>{__("Product")}</ControlLabel>
            <SelectProducts
              label="Choose product"
              name="selectedProductId"
              initialValue={state.productId}
              onSelect={(productId) => setState({ ...state, productId: productId as string })}
              multi={false}
              customOption={{ value: "", label: "Empty" }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>
              {__("Product Type")}
            </ControlLabel>
            <FormControl
              name="productType"
              componentclass="select"
              value={state.productType}
              onChange={e => setState({ ...state, productType: (e.target as any).value })}
            >
              {["private", "public"].map((typeName) => (
                <option key={typeName} value={typeName}>
                  {typeName}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Destination Stage</ControlLabel>
            <BoardSelectContainer
              type="deal"
              autoSelectStage={false}
              boardId={currentMap.boardId}
              pipelineId={currentMap.pipelineId}
              stageId={currentMap.stageId}
              onChangeBoard={(boardId) => setCurrentMap({ ...currentMap, boardId: boardId })}
              onChangePipeline={(pipelineId) => setCurrentMap({ ...currentMap, pipelineId: pipelineId })}
              onChangeStage={(stageId) => setCurrentMap({ ...currentMap, stageId: stageId })}
            />
          </FormGroup>
        </CollapseContent>
        <CollapseContent title={__("Requirements")}>
          {renderItem("requirementsTxt", "", { componentclass: "textarea" })}
          {renderItem("customerDocumentsTxt", "", { componentclass: "textarea" })}
          {renderItem("companyDocumentsTxt", "", { componentclass: "textarea" })}
        </CollapseContent>
      </ContentBox>
    </ScrollWrapper>
  );

  return (
    <ContentWrapper>
      <Wrapper.ActionBar
        left={<Title>{__("Journals configs")}</Title>}
        right={actionButtons}
      />
      {content}
    </ContentWrapper>
  );
};

export default GeneralSettings;
