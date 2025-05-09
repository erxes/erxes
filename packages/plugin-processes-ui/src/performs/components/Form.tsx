import { gql } from "@apollo/client";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import ProductChooser from "@erxes/ui-products/src/containers/ProductChooser";
import { IProduct } from "@erxes/ui-products/src/types";
import { SelectTeamMembers } from "@erxes/ui/src";
import client from "@erxes/ui/src/apolloClient";
import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import CommonForm from "@erxes/ui/src/components/form/Form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src/layout/styles";
import {
  DateContainer,
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { confirm } from "@erxes/ui/src/utils";
import Alert from "@erxes/ui/src/utils/Alert";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { __ } from "coreui/utils";
import React from "react";
import { JOB_TYPE_CHOISES } from "../../constants";
import SelectJobRefer from "../../job/containers/refer/SelectJobRefer";
import { queries } from "../../job/graphql";
import { IOverallWorkDet } from "../../overallWork/types";
import { AddTrigger, TableOver } from "../../styles";
import { IProductsData } from "../../types";
import { IPerform } from "../types";
import FormPrintAction from "./FormPrintAction";
import PerformDetail from "./PerformDetail";

type Props = {
  renderButton: (
    props: IButtonMutateProps & { disabled?: boolean }
  ) => JSX.Element;
  closeModal: () => void;
  perform?: IPerform;
  overallWorkDetail?: IOverallWorkDet;
  max: number;
  confirmPerform: (_id: string, endAt: Date) => void;
  abortPerform: (_id: string) => void;
};

type State = {
  overallWorkDet: IOverallWorkDet;
  count: number;
  description: string;
  appendix: string;
  assignedUserIds: string[];
  customerId: string;
  companyId: string;
  startAt: Date;
  endAt: Date;
  needProducts: IProductsData[];
  resultProducts: IProductsData[];
  inProducts: IProductsData[];
  outProducts: IProductsData[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { overallWorkDetail, perform } = this.props;
    let startAt = new Date();
    let endAt = new Date();

    const overallWorkDet = overallWorkDetail ||
      (perform && {
        ...perform,
        _id: "",
        key: perform.overallWorkKey,
        startAt: perform.startAt,
        jobReferId: perform.overallWorkKey.typeId || perform.typeId || "",
        dueDate: perform.endAt,
        type: perform.type,
        assignedUserIds: perform.assignedUserIds,
        needProducts: perform.needProducts,
        resultProducts: perform.resultProducts,
        count: perform.count,
        needProductsData: perform.needProducts,
        resultProductsData: perform.resultProducts,
        workIds: [],
      }) || {
      _id: "",
      key: {
        type: "",
        inBranchId: "",
        inDepartmentId: "",
        outBranchId: "",
        outDepartmentId: "",
      },
      startAt,
      dueDate: endAt,
      type: "",
      assignedUserIds: [],
      needProducts: [],
      resultProducts: [],
      count: 0,
      needProductsData: [],
      resultProductsData: [],
      workIds: [],
    };

    const overCount = overallWorkDet.count;
    let count = 1;
    const needProducts = overallWorkDet.needProductsData.map((np) => ({
      ...np,
      quantity: np.quantity / overCount,
    }));
    const resultProducts = overallWorkDet.resultProductsData.map((rp) => ({
      ...rp,
      quantity: rp.quantity / overCount,
    }));

    let inProducts = needProducts;
    let outProducts = resultProducts;

    if (perform) {
      startAt = perform.startAt;
      count = perform ? perform.count : 1;
      inProducts = perform.inProducts;
      outProducts = perform.outProducts;
      if (perform.status === "confirmed") {
        endAt = perform.endAt;
      } else {
        endAt = new Date();
      }
    }

    this.state = {
      overallWorkDet,
      startAt,
      endAt,
      count,
      description: perform?.description || "",
      appendix: perform?.appendix || "",
      assignedUserIds: perform?.assignedUserIds || [],
      customerId: perform?.customerId || "",
      companyId: perform?.companyId || "",
      needProducts,
      resultProducts,
      inProducts,
      outProducts,
    };
  }

  generateDoc = (values: {
    _id?: string;
    needProducts: IProductsData[];
    resultProducts: IProductsData[];
  }) => {
    const { perform } = this.props;
    const { overallWorkDet } = this.state;

    const { key } = overallWorkDet;
    const {
      type,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      typeId,
    } = key;
    const finalValues = values;
    const {
      count,
      startAt,
      endAt,
      description,
      appendix,
      assignedUserIds,
      customerId,
      companyId,
      inProducts,
      outProducts,
      needProducts,
      resultProducts,
    } = this.state;

    if (perform) {
      finalValues._id = perform._id;
    }

    return {
      ...(perform || {}),
      ...finalValues,
      overallWorkId: overallWorkDet._id,
      overallWorkKey: key,
      startAt,
      endAt,
      type,
      typeId,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      count,
      description,
      appendix,
      assignedUserIds,
      customerId,
      companyId,
      inProducts,
      outProducts: type === "move" ? inProducts : outProducts,
      needProducts,
      resultProducts: type === "move" ? needProducts : resultProducts,
    };
  };

  checkValidation = () => {
    const { max } = this.props;
    const { overallWorkDet, inProducts, outProducts } = this.state;

    if (
      overallWorkDet.type === "income" &&
      !(
        overallWorkDet.key.outBranchId &&
        overallWorkDet.key.outDepartmentId &&
        outProducts.length
      )
    ) {
      return false;
    }
    if (
      overallWorkDet.type === "outlet" &&
      !(
        overallWorkDet.key.inBranchId &&
        overallWorkDet.key.inDepartmentId &&
        inProducts.length
      )
    ) {
      return false;
    }

    if (overallWorkDet.type === "move" && !inProducts.length) {
      return false;
    }

    if (
      ["job", "end", "move"].includes(overallWorkDet.type) &&
      !(
        overallWorkDet.key.inBranchId &&
        overallWorkDet.key.inDepartmentId &&
        overallWorkDet.key.outBranchId &&
        overallWorkDet.key.outDepartmentId
      )
    ) {
      return false;
    }
    if (
      ["job", "end"].includes(overallWorkDet.type) &&
      !overallWorkDet.jobReferId
    ) {
      return false;
    }
    if (overallWorkDet.type !== "income" && max < this.state.count) {
      return false;
    }
    return true;
  };

  checkSave = () => {
    const { overallWorkDet, inProducts, outProducts } = this.state;

    if (!inProducts.length && !outProducts.length) {
      return false;
    }
    if (
      !(
        (overallWorkDet.key.inBranchId && overallWorkDet.key.inDepartmentId) ||
        (overallWorkDet.key.outBranchId && overallWorkDet.key.outDepartmentId)
      )
    ) {
      return false;
    }
    return true;
  };

  confirm = () => {
    const { confirmPerform, perform } = this.props;
    if (!perform) {
      Alert.info("After saving confirm");
      return;
    }

    confirm(__("Confirm this performance?")).then(() => {
      confirmPerform(perform._id || "", this.state.endAt);
    });
  };

  abort = () => {
    const { abortPerform, perform } = this.props;

    if (!perform || perform.status !== "confirmed") {
      Alert.info("After confirming abort");
      return;
    }

    confirm(__("Abort this performance?")).then(() => {
      abortPerform(perform._id || "");
    });
  };

  setStateWrapper = (state) => {
    this.setState({ ...state });
  };

  renderViewInfo = (name: string, variable: number, uom: string) => {
    return (
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>
          {variable || 0} /${uom}/
        </SidebarCounter>
      </li>
    );
  };

  renderProductsInfo = (name: string, products: any[]) => {
    const { count } = this.state;
    const result: React.ReactNode[] = [];

    result.push(
      <li key={Math.random()}>
        <FieldStyle>{__(name)}</FieldStyle>
        <SidebarCounter>{(products || []).length}</SidebarCounter>
      </li>
    );

    for (const product of products) {
      const { uom } = product;
      const productName = product.product
        ? `${product.product.code} - ${product.product.name}`
        : "not nameqqq";
      const uomCode = uom;

      result.push(
        this.renderViewInfo(productName, product.quantity * count, uomCode)
      );
    }

    return result;
  };

  renderDetailNeed() {
    const { needProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsInfo("Need Products", needProducts || [])}
      </SidebarList>
    );
  }

  renderDetailResult() {
    const { resultProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsInfo("Result Products", resultProducts || [])}
      </SidebarList>
    );
  }

  renderBulkProductChooser(
    productsData: any[],
    stateName: "inProducts" | "outProducts"
  ) {
    const productOnChange = (products: IProduct[]) => {
      const currentProductIds = productsData.map((p) => p.productId);

      for (const product of products) {
        if (currentProductIds.includes(product._id)) {
          continue;
        }

        productsData.push({
          _id: Math.random(),
          quantity: 1,
          uom: product.uom,
          productId: product._id,
          product: product,
        });
      }

      const chosenProductIds = products.map((p) => p._id);
      this.setStateWrapper({
        [stateName]: productsData.filter((pd) =>
          chosenProductIds.includes(pd.productId)
        ),
      } as any);
    };

    const content = (props) => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        data={{
          name: "Product",
          products: productsData.filter((p) => p.product).map((p) => p.product),
        }}
      />
    );

    const trigger = (
      <AddTrigger>
        <Button btnStyle="primary" icon="plus-circle">
          Add Product / Service
        </Button>
      </AddTrigger>
    );

    return (
      <ModalTrigger
        title="Choose product & service"
        trigger={trigger}
        dialogClassName="modal-1400w"
        size="xl"
        content={content}
      />
    );
  }

  onChangePerView = (values: any) => {
    this.setStateWrapper({
      ...values,
    } as any);
  };

  focusNext = (index: number, length: number, val?: number) => {
    let next = index + (val || 1);
    if (next >= length) {
      next = 0;
    }
    if (next < 0) {
      next = length - 1;
    }

    document
      .getElementsByClassName("canFocus")[next]
      .getElementsByTagName("input")[0]
      .focus();
  };

  deleteDetail = (stateName, productsData, removeId) => {
    this.setStateWrapper({
      [stateName]: productsData.filter((pd) =>
        pd._id !== removeId
      ),
    } as any);
  }

  renderProducts = (
    title: string,
    productsData: any[],
    stateName: "inProducts" | "outProducts"
  ) => {
    return (
      <>
        <TableOver>
          <thead>
            <tr>
              <th>
                {__(title)} {(productsData || []).length}
              </th>
              <th>{__("UOM")}</th>
              <th>{__("Quantity")}</th>
              <th>{__("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {productsData.map((pd, index) => {
              return (
                <PerformDetail
                  key={pd._id}
                  productData={pd}
                  productsData={productsData}
                  stateName={stateName}
                  onChangeState={this.onChangePerView}
                  isReadSeries={stateName === "inProducts"}
                  onEnter={(val) =>
                    this.focusNext(index, productsData.length, val)
                  }
                  deleteDetail={this.deleteDetail}
                />
              );
            })}
          </tbody>
        </TableOver>

        {this.renderBulkProductChooser(productsData, stateName)}
      </>
    );
  };

  renderProductsIncome = (productsData: any[]) => {
    return (
      <>
        <TableOver>
          <thead>
            <tr>
              <th>
                {__("Receipt Products")} {(productsData || []).length}
              </th>
              <th>{__("UOM")}</th>
              <th>{__("Quantity")}</th>
              <th>{__("Amount")}</th>
            </tr>
          </thead>
          <tbody>
            {productsData.map((pd, index) => {
              return (
                <PerformDetail
                  key={pd._id}
                  productData={pd}
                  productsData={productsData}
                  stateName={"outProducts"}
                  hasCost={true}
                  onChangeState={this.onChangePerView}
                  onEnter={(val) =>
                    this.focusNext(index, productsData.length, val)
                  }
                  deleteDetail={this.deleteDetail}
                />
              );
            })}
          </tbody>
        </TableOver>

        {this.renderBulkProductChooser(productsData, "outProducts")}
      </>
    );
  };

  renderPerformIn() {
    const { inProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProducts("Spend Products", inProducts || [], "inProducts")}
      </SidebarList>
    );
  }

  renderPerformOut() {
    const { outProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProducts(
          "Receipt Products",
          outProducts || [],
          "outProducts"
        )}
      </SidebarList>
    );
  }

  renderPerformIncome() {
    const { outProducts } = this.state;

    return (
      <SidebarList className="no-link">
        {this.renderProductsIncome(outProducts || [])}
      </SidebarList>
    );
  }

  renderPerformDetails() {
    const { overallWorkDet } = this.state;
    const { type } = overallWorkDet;

    if (type === "income") {
      return (
        <>
          <FormColumn>{this.renderPerformIncome()}</FormColumn>
        </>
      );
    }

    if (type === "outlet" || type === "move") {
      return (
        <>
          <FormColumn>{this.renderPerformIn()}</FormColumn>
        </>
      );
    }

    return (
      <>
        <FormColumn>{this.renderPerformIn()}</FormColumn>
        <FormColumn>{this.renderPerformOut()}</FormColumn>
      </>
    );
  }

  onChangeCount = (e) => {
    const { needProducts, resultProducts } = this.state;
    const count = Number(e.target.value);

    this.setStateWrapper({
      count,
      inProducts: needProducts.map((np) => ({
        ...np,
        quantity: np.quantity * count,
      })),
      outProducts: resultProducts.map((rp) => ({
        ...rp,
        quantity: rp.quantity * count,
      })),
    });
  };

  onChangeInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setStateWrapper({ [name]: value } as any);
  };

  renderLabel = (max?: number) => {
    return max && max > 0 ? `Count /max: ${max}/` : `Count`;
  };

  onSelectDate = (value, name) => {
    this.setStateWrapper({ [name]: value } as any);
  };

  renderLocLabel(obj) {
    if (!obj) {
      return "unknown";
    }

    return `${obj.code} - ${obj.title}`;
  }

  setLocations = (name, value) => {
    const { overallWorkDet } = this.state;
    this.setStateWrapper({
      overallWorkDet: {
        ...overallWorkDet,
        key: { ...overallWorkDet.key, [name]: value },
      },
    });
  };

  renderInLoc() {
    const { overallWorkDetail } = this.props;
    const { overallWorkDet } = this.state;
    if (!overallWorkDetail) {
      return (
        <FormColumn>
          <FormGroup>
            <ControlLabel>{__(`Spend Branch`)}</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="inBranchId"
              initialValue={overallWorkDet.inBranchId || ""}
              customOption={{
                value: "",
                label: "...Clear branch filter",
              }}
              onSelect={(branchId) => this.setLocations("inBranchId", branchId)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__(`Spend Department`)}</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="inDepartmentId"
              initialValue={overallWorkDet.inDepartmentId || ""}
              customOption={{
                value: "",
                label: "...Clear department filter",
              }}
              onSelect={(departmentId) =>
                this.setLocations("inDepartmentId", departmentId)
              }
              multi={false}
            />
          </FormGroup>
        </FormColumn>
      );
    }
    return (
      <FormColumn>
        <FormGroup>
          <ControlLabel>
            {__(`Spend Branch`)}:{" "}
            {this.renderLocLabel(overallWorkDetail.inBranch)}
          </ControlLabel>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            {__(`Spend Department`)}:{" "}
            {this.renderLocLabel(overallWorkDetail.inDepartment)}
          </ControlLabel>
        </FormGroup>
      </FormColumn>
    );
  }

  renderOutLoc() {
    const { overallWorkDetail } = this.props;
    const { overallWorkDet } = this.state;
    if (!overallWorkDetail) {
      return (
        <FormColumn>
          <FormGroup>
            <ControlLabel>{__(`Receipt Branch`)}</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="outBranchId"
              initialValue={overallWorkDet.outBranchId || ""}
              customOption={{
                value: "",
                label: "...Clear branch filter",
              }}
              onSelect={(branchId) =>
                this.setLocations("outBranchId", branchId)
              }
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__(`Receipt Department`)}</ControlLabel>
            <SelectDepartments
              label="Choose department"
              name="outDepartmentId"
              initialValue={overallWorkDet.outDepartmentId || ""}
              customOption={{
                value: "",
                label: "...Clear department filter",
              }}
              onSelect={(departmentId) =>
                this.setLocations("outDepartmentId", departmentId)
              }
              multi={false}
            />
          </FormGroup>
        </FormColumn>
      );
    }

    return (
      <FormColumn>
        <FormGroup>
          <ControlLabel>
            {__(`Receipt Branch`)}:{" "}
            {this.renderLocLabel(overallWorkDetail.outBranch)}
          </ControlLabel>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            {__(`Receipt Department`)}:{" "}
            {this.renderLocLabel(overallWorkDetail.outDepartment)}
          </ControlLabel>
        </FormGroup>
      </FormColumn>
    );
  }

  renderLocations() {
    const { overallWorkDet } = this.state;
    const { type } = overallWorkDet;

    if (type === "income") {
      return <FormWrapper>{this.renderOutLoc()}</FormWrapper>;
    }
    if (type === "outlet") {
      return <FormWrapper>{this.renderInLoc()}</FormWrapper>;
    }

    return (
      <FormWrapper>
        {this.renderInLoc()}
        {this.renderOutLoc()}
      </FormWrapper>
    );
  }

  renderJobRefer() {
    const { overallWorkDetail } = this.props;
    const { overallWorkDet } = this.state;

    if (overallWorkDetail) {
      return <></>;
    }

    if (["income", "outlet", "move"].includes(overallWorkDet.type)) {
      return <></>;
    }

    const setJobRefer = (value) => {
      client
        .query({
          query: gql(queries.jobReferDetail),
          fetchPolicy: "network-only",
          variables: { id: value },
        })
        .then(({ data }) => {
          this.setStateWrapper({
            overallWorkDet: {
              ...overallWorkDet,
              key: { ...overallWorkDet.key, typeId: value },
              jobReferId: value,
              jobRefer: data.jobReferDetail,
              needProducts: data.jobReferDetail.needProducts,
              resultProducts: data.jobReferDetail.resultProducts,
            },
            needProducts: data.jobReferDetail.needProducts,
            resultProducts: data.jobReferDetail.resultProducts,
            inProducts: data.jobReferDetail.needProducts,
            outProducts: data.jobReferDetail.resultProducts,
          });
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    return (
      <FormGroup>
        <ControlLabel>Job Refer</ControlLabel>
        <SelectJobRefer
          label={__("Choose jobRefer")}
          name="jobReferId"
          initialValue={overallWorkDet.jobReferId || ""}
          customOption={{
            value: "",
            label: "...Clear jobRefer filter",
          }}
          filterParams={{ types: [overallWorkDet.type] }}
          onSelect={(jobReferId) => setJobRefer(jobReferId)}
          multi={false}
        />
      </FormGroup>
    );
  }

  renderCOC() {
    const { perform } = this.props;
    const { overallWorkDet } = this.state;
    const { type } = overallWorkDet;

    if (["income", "outlet"].includes(type)) {
      return (
        <>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__("Company")}</ControlLabel>
              <SelectCompanies
                label={__("Choose company")}
                name="companyId"
                initialValue={perform?.companyId || ""}
                onSelect={(companyId) =>
                  this.setStateWrapper({ companyId: companyId as string })
                }
                customOption={{
                  value: "",
                  label: "No company",
                }}
                multi={false}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__("Customer")}</ControlLabel>
              <SelectCustomers
                label={__("Choose company")}
                name="customerId"
                initialValue={perform?.customerId || ""}
                onSelect={(customerId) =>
                  this.setStateWrapper({ customerId: customerId as string })
                }
                customOption={{
                  value: "",
                  label: "No customer",
                }}
                multi={false}
              />
            </FormGroup>
          </FormColumn>
        </>
      );
    }
    return;
  }

  renderDocuments() {
    const { perform } = this.props;
    if (!perform || !perform._id) {
      return <></>;
    }

    if (!isEnabled("documents")) {
      return <></>;
    }

    return <FormPrintAction perform={perform} />;
  }

  renderConfirmOrAbort() {
    const { perform } = this.props;
    if (!perform || !perform._id) {
      return <></>;
    }

    if (perform.status === "confirmed") {
      return (
        <Button
          btnStyle="warning"
          onClick={this.abort}
          icon="link-broken"
          uppercase={false}
        >
          Abort
        </Button>
      );
    }

    if (perform.status !== "confirmed") {
      return (
        <Button
          btnStyle="success"
          onClick={this.confirm}
          icon="shield-check"
          uppercase={false}
          disabled={!this.checkValidation()}
        >
          Confirm
        </Button>
      );
    }
    return <></>;
  }

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, max, perform } = this.props;
    const { overallWorkDet } = this.state;
    const { values, isSubmitted } = formProps;
    const { count, startAt, endAt, description, appendix } = this.state;

    if (!overallWorkDet.type) {
      const onchangeType = (e) => {
        const value = e.target.value;
        this.setStateWrapper({
          overallWorkDet: {
            ...overallWorkDet,
            type: value,
            key: { ...overallWorkDet.key, type: value },
          },
        });
      };
      return (
        <FormGroup>
          <ControlLabel>Type</ControlLabel>
          <FormControl
            name="type"
            componentclass="select"
            value={""}
            required={false}
            onChange={onchangeType}
          >
            <option value="">Choose type</option>
            {Object.keys(JOB_TYPE_CHOISES).map((jt) => (
              <option value={jt} key={Math.random()}>
                {JOB_TYPE_CHOISES[jt]}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      );
    }

    return (
      <>
        <ControlLabel>Type: {overallWorkDet.type} </ControlLabel>
        {overallWorkDet.jobRefer && (
          <ControlLabel>
            , Job Refer:{" "}
            {`${overallWorkDet.jobRefer.code} - ${overallWorkDet.jobRefer.name}`}
          </ControlLabel>
        )}

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__(`Start Date`)}</ControlLabel>
              <DateContainer>
                <DateControl
                  name="startAt"
                  dateFormat="YYYY/MM/DD"
                  timeFormat={true}
                  placeholder="Choose date"
                  value={startAt}
                  onChange={(value) => this.onSelectDate(value, "startAt")}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>
                {this.renderLabel(max)}
              </ControlLabel>
              <FormControl
                name="count"
                defaultValue={count}
                type="number"
                max={overallWorkDet.type !== "income" ? max : undefined}
                autoFocus={true}
                required={true}
                onChange={this.onChangeCount}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>{__("Assegned To")}</ControlLabel>
              <SelectTeamMembers
                label={__("Choose team member")}
                name="assignedUserIds"
                initialValue={perform ? perform.assignedUserIds : [] || []}
                onSelect={(userIds) =>
                  this.setStateWrapper({ assignedUserIds: userIds as string[] })
                }
                multi={false}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__("Description")}</ControlLabel>
              <FormControl
                name="description"
                defaultValue={description}
                onChange={this.onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__("Appendix")}</ControlLabel>
              <FormControl
                name="appendix"
                defaultValue={appendix}
                onChange={this.onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          {this.renderCOC()}
        </FormWrapper>

        {this.renderJobRefer()}
        {this.renderLocations()}

        <Box title={"Plan Details:"}>
          <FormWrapper>
            <FormColumn>{this.renderDetailNeed()}</FormColumn>
            <FormColumn>{this.renderDetailResult()}</FormColumn>
          </FormWrapper>
        </Box>

        <Box title={"Perform Details:"}>
          <FormWrapper>{this.renderPerformDetails()}</FormWrapper>
        </Box>

        <ModalFooter>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__(`End Date`)}</ControlLabel>
                <DateContainer>
                  <DateControl
                    name="endAt"
                    dateFormat="YYYY/MM/DD"
                    timeFormat={true}
                    placeholder={__("Choose date")}
                    value={endAt}
                    onChange={(value) => this.onSelectDate(value, "endAt")}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>

            <FormColumn>{this.renderDocuments()}</FormColumn>

            <FormColumn>
              <Button
                btnStyle="simple"
                onClick={closeModal}
                icon="times-circle"
                uppercase={false}
              >
                Close
              </Button>

              {(!perform || perform.status !== "confirmed") &&
                renderButton({
                  name: "Performance",
                  values: this.generateDoc(values),
                  isSubmitted,
                  callback: () => { },
                  disabled: !this.checkSave(),
                })}
              {this.renderConfirmOrAbort()}
            </FormColumn>
          </FormWrapper>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
