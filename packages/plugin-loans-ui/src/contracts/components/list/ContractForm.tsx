import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import dayjs from "dayjs";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import moment from "moment";
import React, { useState } from "react";
import Select from "react-select";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectContractType, {
  ContractTypeById,
} from "../../../contractTypes/containers/SelectContractType";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectSavingContract, {
  Contracts,
} from "../collaterals/SelectSavingContract";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import Table from "@erxes/ui/src/components/table";
import { __ } from "coreui/utils";
import { DateContainer } from "@erxes/ui/src/styles/main";
import { generateCustomGraphic, getDiffDay } from "../../utils/customGraphic";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { IContract, IContractDoc } from "../../types";
import { IContractType } from "../../../contractTypes/types";
import { IUser } from "@erxes/ui/src/auth/types";
import { LEASE_TYPES } from "../../../contractTypes/constants";
import { LoanPurpose, ORGANIZATION_TYPE } from "../../../constants";
import { LoanSchedule } from "../../interface/LoanContract";
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from "@erxes/ui/src/styles/eindex";
import { RelType } from "../../containers/ContractForm";
import { Tabs as MainTabs, TabTitle } from "@erxes/ui/src/components/tabs";

const onFieldClick = (e) => {
  e.target.select();
};

type Props = {
  currentUser: IUser;
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean }
  ) => JSX.Element;
  contract?: IContract;
  closeModal: () => void;
  change?: boolean;
  data?: RelType;
};

interface IConfig {
  maxAmount: number;
  minAmount: number;
  maxTenor: number;
  minTenor: number;
  maxInterest: number;
  minInterest: number;
  savingPlusLoanInterest: number;
  savingUpperPercent: number;
}

function isGreaterNumber(value: any, compareValue: any) {
  value = Number(value || 0);
  compareValue = Number(compareValue || 0);
  return value > compareValue;
}

function getValue(value, defaultValue) {
  if (!value) {
    return defaultValue;
  }
  return value;
}

function generateDefault(props) {
  const { contract = {} } = props;
  return {
    _id: contract._id,
    contractNumber: contract.number,
    contractDate: getValue(contract.contractDate, new Date()),
    endDate: contract.endDate,
    loanPurpose: contract.loanPurpose,
    loanDestination: contract.loanDestination,
    loanSubPurpose: contract.loanSubPurpose,
    contractTypeId: contract.contractTypeId,
    status: contract.status || "normal",
    branchId: contract.branchId,
    leaseType: contract.leaseType,
    description: contract.description,
    marginAmount: getValue(contract.marginAmount, 0),
    leaseAmount: getValue(contract.leaseAmount, 0),
    feeAmount: getValue(contract.feeAmount, 0),
    tenor: getValue(contract.tenor, 0),
    lossPercent: getValue(contract.lossPercent, 0),
    lossCalcType: contract.lossCalcType,
    interestRate: getValue(contract.interestRate, 0),
    interestMonth: getValue(contract.interestRate, 0) / 12,
    repayment: getValue(contract.repayment, "fixed"),
    startDate: getValue(contract.startDate, new Date()),
    scheduleDays: getValue(contract.scheduleDays, [new Date().getDate()]),
    debt: getValue(contract.debt, 0),
    debtTenor: getValue(contract.debtTenor, 0),
    debtLimit: getValue(contract.debtLimit, 0),
    salvageAmount: getValue(contract.salvageAmount, 0),
    salvagePercent: getValue(contract.salvagePercent, 0),
    salvageTenor: getValue(contract.salvageTenor, 0),
    skipInterestCalcMonth: getValue(contract.skipInterestCalcMonth, 0),
    useDebt: contract.useDebt,
    useMargin: contract.useMargin,
    useSkipInterest: contract.useSkipInterest,
    relationExpertId: getValue(contract.relationExpertId, ""),
    leasingExpertId: getValue(contract.leasingExpertId, ""),
    riskExpertId: getValue(contract.riskExpertId, ""),
    customerId: getValue(contract.customerId, ""),
    customerType: getValue(contract.customerType, "customer"),
    weekends: getValue(contract.weekends, []),
    useHoliday: getValue(contract.useHoliday, false),
    relContractId: getValue(contract.relContractId, ""),
    skipAmountCalcMonth: getValue(contract.skipAmountCalcMonth, 0),
    customInterest: getValue(contract.customInterest, 0),
    customPayment: getValue(contract.customPayment, 0),
    currency: getValue(
      contract.currency,
      props.currentUser?.configs?.dealCurrency?.[0]
    ),
    downPayment: getValue(contract.downPayment, 0),
    useFee: contract.useFee,
    useManualNumbering: contract.useManualNumbering,
    commitmentInterest: contract.commitmentInterest,
    savingContractId: contract.savingContractId,
    firstPayDate: contract.firstPayDate,
    holidayType: getValue(contract.holidayType, "before"),
    depositAccountId: contract.depositAccountId,
    dealId: contract.dealId || "",
  };
}

interface ITabItem {
  component: any;
  label: string;
}

interface ITabs {
  tabs: ITabItem[];
}

export function Tabs({ tabs }: ITabs) {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <>
      <MainTabs>
        {tabs.map((tab, index) => (
          <TabTitle
            className={tabIndex === index ? "active" : ""}
            key={`tab${tab.label}`}
            onClick={() => setTabIndex(index)}
          >
            {tab.label}
          </TabTitle>
        ))}
      </MainTabs>

      <div style={{ width: "100%", marginTop: 20 }}>
        {tabs?.[tabIndex]?.component}
      </div>
    </>
  );
}

function ContractForm(props: Props) {
  const { contract } = props;

  const [state, setState] = useState(generateDefault(props));
  const [config, setConfig] = useState<IConfig>();
  const [schedule, setSchedule] = useState<LoanSchedule[]>(
    contract?.repayment === "custom"
      ? generateCustomGraphic({
          dateRange: contract.scheduleDays,
          interestRate: contract.interestRate,
          leaseAmount: contract.leaseAmount,
          startDate: contract.startDate,
          tenor: contract.tenor,
          isPayFirstMonth: contract.isPayFirstMonth,
          skipAmountCalcMonth: contract.skipAmountCalcMonth,
          customPayment: contract.customPayment,
          customInterest: contract.customInterest,
          firstPayDate: contract.firstPayDate,
        })
      : []
  );
  const [changeRowIndex, setChangeRowIndex] = useState<number>();

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const { contract } = props;

    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    const result = {
      ...state,
      contractTypeId: state.contractTypeId,
      branchId: state.branchId,
      status: state.status,
      description: state.description,
      createdBy: finalValues.createdBy,
      createdAt: finalValues.createdAt,
      marginAmount: Number(state.marginAmount),
      leaseAmount: Number(state.leaseAmount),
      feeAmount: Number(state.feeAmount),
      tenor: Number(state.tenor),
      lossPercent: Number(state.lossPercent),
      interestRate: Number(state.interestRate),
      skipInterestCalcMonth: Number(state.skipInterestCalcMonth),
      skipAmountCalcMonth: Number(state.skipAmountCalcMonth),
      customPayment: Number(state.customPayment),
      customInterest: Number(state.customInterest),
      repayment: state.repayment,
      lossCalcType: state.lossCalcType || "fromInterest",
      startDate: state.startDate || new Date(),
      scheduleDays: state.scheduleDays,
      debt: Number(state.debt),
      debtTenor: Number(state.debtTenor),
      debtLimit: Number(state.debtLimit),
      customerId: state.customerId || "",
      customerType: state.customerType || "",
      salvageAmount: 0,
      salvagePercent: 0,
      salvageTenor: 0,
      useDebt: state.useDebt,
      useMargin: state.useMargin,
      useSkipInterest: state.useSkipInterest,
      relationExpertId: state.relationExpertId,
      leasingExpertId: state.leasingExpertId,
      riskExpertId: state.riskExpertId,
      leaseType: state.leaseType,
      savingContractId: state.savingContractId,
      commitmentInterest: state.commitmentInterest,
      weekends: state.weekends?.map((week) => Number(week)),
      useHoliday: Boolean(state.useHoliday),
      relContractId: state.relContractId,
      currency: state.currency,
      downPayment: Number(state.downPayment || 0),
      schedule: schedule,
      useManualNumbering: state.useManualNumbering,
      useFee: state.useFee,
      loanPurpose: state.loanPurpose,
      endDate: state.endDate,
      loanDestination: state.loanDestination,
      holidayType: state.holidayType,
      depositAccountId: state.depositAccountId,
    };

    if (state.leaseType === "salvage") {
      result.salvageAmount = Number(state.salvageAmount);
      result.salvagePercent = Number(state.salvagePercent);
      result.salvageTenor = Number(state.salvageTenor);
    }

    return result;
  };

  const renderFormGroup = (label, props) => {
    if (!label) return <FormControl {...props} />;
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const onChangeField = (e) => {
    const name = (e?.target as HTMLInputElement)?.name;
    let value: any = (e?.target as HTMLInputElement)?.value;

    if ((e?.target as HTMLInputElement)?.type === "checkbox") {
      value = (e.target as HTMLInputElement).checked;
    }

    const repayment = name === "repayment" ? value : state.repayment;

    customGraphicChange(repayment, name, value);

    if (name === "interestRate") {
      setState((v) => ({
        ...v,
        interestRate: Number(value),
        interestMonth: Number(value || 0) / 12,
      }));
      return;
    }

    setState((v) => ({ ...v, [name]: value }));
  };

  const getMainValue = (key, name, value) => {
    return key === name ? value : state[key];
  };

  const customGraphicChange = (repayment, name, value) => {
    if (
      (name === "repayment" && repayment === "custom") ||
      (repayment === "custom" &&
        (name === "tenor" ||
          name === "leaseAmount" ||
          name === "customPayment" ||
          name === "customInterest" ||
          name === "scheduleDays" ||
          name === "isPayFirstMonth" ||
          name === "interestRate" ||
          name === "startDate" ||
          name === "firstPayDate" ||
          name === "skipAmountCalcMonth"))
    ) {
      const tenor = Number(getMainValue("tenor", name, value));
      const leaseAmount = Number(getMainValue("leaseAmount", name, value));
      const customPayment = Number(getMainValue("customPayment", name, value));
      const customInterest = Number(
        getMainValue("customInterest", name, value)
      );
      const isPayFirstMonth = getMainValue("isPayFirstMonth", name, value);
      const interestRate = getMainValue("interestRate", name, value);
      const startDate = getMainValue("startDate", name, value);
      const scheduleDays = getMainValue("scheduleDays", name, value);
      const firstPayDate = getMainValue("firstPayDate", name, value);
      const skipAmountCalcMonth = getMainValue(
        "skipAmountCalcMonth",
        name,
        value
      );

      let schedules: LoanSchedule[] = generateCustomGraphic({
        dateRange: scheduleDays,
        interestRate,
        leaseAmount,
        startDate,
        tenor,
        customInterest,
        customPayment,
        isPayFirstMonth,
        skipAmountCalcMonth,
        firstPayDate,
      });
      setSchedule(schedules);
    }
  };

  const onSelectTeamMember = (value, name) => {
    setState((v) => ({ ...v, [name]: value }));
  };

  const onSelectContractType = (value) => {
    const contractTypeObj: IContractType = ContractTypeById[value];

    let changingStateValue: any = {
      contractTypeId: value,
      leaseType: (contractTypeObj && contractTypeObj.leaseType) || "finance",
      commitmentInterest:
        (contractTypeObj && contractTypeObj.commitmentInterest) || 0,
      useMargin: contractTypeObj.useMargin,
      useSkipInterest: contractTypeObj.useSkipInterest,
      useDebt: contractTypeObj.useDebt,
      currency: contractTypeObj.currency,
      useManualNumbering: contractTypeObj?.useManualNumbering,
      useFee: contractTypeObj?.useFee,
    };

    if (
      contractTypeObj.invoiceDay &&
      contractTypeObj.leaseType === LEASE_TYPES.CREDIT
    ) {
      changingStateValue["scheduleDays"] = [contractTypeObj.invoiceDay];
    }

    if (!state.lossPercent) {
      changingStateValue["lossPercent"] = contractTypeObj?.lossPercent;
    }
    if (!state.lossCalcType) {
      changingStateValue["lossCalcType"] = contractTypeObj?.lossCalcType;
    }
    if (!state.interestMonth && contractTypeObj?.config?.defaultInterest) {
      changingStateValue["interestMonth"] = Number(
        contractTypeObj?.config?.defaultInterest
      );
      changingStateValue["interestRate"] = Number(
        contractTypeObj?.config?.defaultInterest || 0
      );
    }

    if (!state.tenor && contractTypeObj?.config?.minTenor) {
      changingStateValue["tenor"] = contractTypeObj?.config?.minTenor;
    }

    if (!state.leaseAmount && contractTypeObj?.config?.minAmount) {
      changingStateValue["leaseAmount"] = contractTypeObj?.config?.minAmount;
    }

    setConfig({
      ...contractTypeObj?.config,
      savingUpperPercent: contractTypeObj.savingUpperPercent,
      savingPlusLoanInterest: contractTypeObj.savingPlusLoanInterest,
    });

    setState((v) => ({ ...v, ...changingStateValue }));
  };

  const onSelectCustomer = (value) => {
    setState((v) => ({ ...v, customerId: value }));
  };

  const onCheckCustomerType = (e) => {
    setState((v) => ({
      ...v,
      customerType: e.target.checked ? "company" : "customer",
    }));
  };

  const checkValidation = (): any => {
    const errors: any = {};

    function errorWrapper(text: string) {
      return <label style={{ color: "red" }}>{text}</label>;
    }

    if (
      state.useMargin &&
      state.leaseAmount &&
      Number(state.marginAmount) < Number(state.leaseAmount)
    )
      errors.marginAmount = errorWrapper(
        "Margin Amount can not be less than lease Amount"
      );

    if (
      config &&
      config.minAmount &&
      isGreaterNumber(config.minAmount, state.leaseAmount)
    )
      errors.leaseAmount = errorWrapper(
        `${__("Lease amount must greater than")} ${config.minAmount}`
      );

    if (
      config &&
      config.maxAmount &&
      isGreaterNumber(state.leaseAmount, config.maxAmount)
    )
      errors.leaseAmount = errorWrapper(
        `${__("Lease amount must less than")} ${config.maxAmount}`
      );

    if (
      config &&
      config.minTenor &&
      isGreaterNumber(config.minTenor, state.tenor)
    )
      errors.tenor = errorWrapper(
        `${__("Tenor must greater than")} ${config.minTenor}`
      );

    if (
      config &&
      config.maxTenor &&
      isGreaterNumber(state.tenor, config.maxTenor)
    )
      errors.tenor = errorWrapper(
        `${__("Tenor must less than")} ${config.maxTenor}`
      );

    if (
      config &&
      config.minInterest &&
      isGreaterNumber(config.minInterest, state.interestRate)
    )
      errors.interestRate = errorWrapper(
        `${__("Interest must greater than")} ${Number(config.minInterest).toFixed(0)}`
      );

    if (
      config &&
      config.maxInterest &&
      isGreaterNumber(state.interestRate, config.maxInterest)
    )
      errors.interestRate = errorWrapper(
        `${__("Interest must less than")} ${Number(config.maxInterest ?? "0").toFixed(0)}`
      );

    return errors;
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeBranchId = (value) => {
      setState((v) => ({ ...v, branchId: value }));
    };

    const onChangeContractDate = (value) => {
      setState((v) => ({ ...v, contractDate: value }));
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <div style={{ paddingBottom: "13px", paddingTop: "20px" }}>
                {renderFormGroup("Is Organization", {
                  ...formProps,
                  className: "flex-item",
                  type: "checkbox",
                  componentclass: "checkbox",
                  name: "customerType",
                  checked: state.customerType === "company",
                  onChange: onCheckCustomerType,
                })}
              </div>
              {state.customerType === "customer" && (
                <FormGroup>
                  <ControlLabel required={true}>{__("Customer")}</ControlLabel>
                  <SelectCustomers
                    label={__("Choose customer")}
                    name="customerId"
                    initialValue={state.customerId}
                    onSelect={onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}
              {state.customerType === "company" && (
                <FormGroup>
                  <ControlLabel required={true}>{__("Company")}</ControlLabel>
                  <SelectCompanies
                    label={__("Choose company")}
                    name="customerId"
                    initialValue={state.customerId}
                    onSelect={onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}
              {state.useManualNumbering &&
                renderFormGroup("Contract Number", {
                  ...formProps,
                  name: "contractNumber",
                  value: state.contractNumber,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}

              {state.useFee &&
                renderFormGroup("Fee Amount", {
                  ...formProps,
                  type: "number",
                  name: "feeAmount",
                  useNumberFormat: true,
                  fixed: 2,
                  value: state.feeAmount || 0,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}

              {state.useMargin &&
                renderFormGroup("Margin Amount", {
                  ...formProps,
                  type: "number",
                  name: "marginAmount",
                  useNumberFormat: true,
                  fixed: 2,
                  value: state.marginAmount || 0,
                  required: true,
                  errors: checkValidation(),
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
              {props.currentUser?.configs?.loansConfig?.organizationType ===
                ORGANIZATION_TYPE.BBSB && (
                <FormGroup>
                  <ControlLabel required={true}>{__("Loan Type")}</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="loanDestination"
                    componentclass="select"
                    value={state.loanDestination}
                    onChange={onChangeField}
                  >
                    {LoanPurpose.destination.map((type) => (
                      <option key={type.code} value={type.code}>
                        {__(type.name)}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              )}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__("Contract Date")}
                </ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    dateFormat="YYYY/MM/DD"
                    name="contractDate"
                    value={state.contractDate}
                    onChange={onChangeContractDate}
                  />
                </DateContainer>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__("Contract Type")}
                </ControlLabel>
                <SelectContractType
                  label={__("Choose type")}
                  name="contractTypeId"
                  value={state.contractTypeId || ""}
                  onSelect={onSelectContractType}
                  multi={false}
                ></SelectContractType>
              </FormGroup>
              {props.currentUser?.configs?.loansConfig?.organizationType ===
                ORGANIZATION_TYPE.BBSB && (
                <FormGroup>
                  <ControlLabel required={true}>
                    {__("Loan Purpose")}
                  </ControlLabel>
                  <FormControl
                    {...formProps}
                    name="loanPurpose"
                    componentclass="select"
                    value={state.loanPurpose}
                    onChange={onChangeField}
                  >
                    {LoanPurpose.purpose
                      .filter((a) =>
                        state.loanDestination
                          ? a.parent === state.loanDestination
                          : true
                      )
                      .map((type) => (
                        <option key={type.name} value={type.name}>
                          {__(type.name)}
                        </option>
                      ))}
                  </FormControl>
                </FormGroup>
              )}
              {state.useMargin &&
                renderFormGroup("Down payment", {
                  ...formProps,
                  type: "number",
                  name: "downPayment",
                  useNumberFormat: true,
                  fixed: 2,
                  value: state.downPayment || 0,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__("Branches")}</ControlLabel>
                <SelectBranches
                  name="branchId"
                  label={__("Choose branch")}
                  initialValue={state?.branchId}
                  onSelect={onChangeBranchId}
                  multi={false}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("Leasing Expert")}</ControlLabel>
                <SelectTeamMembers
                  label={__("Choose an leasing expert")}
                  name="leasingExpertId"
                  initialValue={state.leasingExpertId}
                  onSelect={onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>
              {state.leaseType === LEASE_TYPES.SAVING && (
                <FormGroup>
                  <ControlLabel required={true}>
                    {__("Saving Contract")}
                  </ControlLabel>
                  <SelectSavingContract
                    label={__("Choose an contract")}
                    name="depositAccount"
                    initialValue={state.savingContractId}
                    filterParams={{
                      isDeposit: false,
                      customerId: state.customerId,
                    }}
                    onSelect={(v) => {
                      if (typeof v === "string") {
                        const savingContract = Contracts[v];

                        let changeState: any = {
                          savingContractId: v,
                          endDate: savingContract.endDate,
                        };
                        if (
                          config?.savingUpperPercent &&
                          config?.savingPlusLoanInterest
                        ) {
                          changeState.leaseAmount =
                            (savingContract.savingAmount *
                              config?.savingUpperPercent) /
                            100;
                          changeState.interestRate =
                            savingContract.interestRate +
                            config?.savingPlusLoanInterest;
                          changeState.tenor = dayjs(
                            savingContract.endDate
                          ).diff(dayjs(state.startDate ?? new Date()), "month");
                        }
                        setState((v) => ({ ...v, ...changeState }));
                      }
                    }}
                    multi={false}
                  />
                </FormGroup>
              )}

              <FormGroup>
                <ControlLabel required={true}>
                  {__("Deposit Contract")}
                </ControlLabel>
                <SelectSavingContract
                  label={__("Choose an contract")}
                  name="depositAccountId"
                  initialValue={state.depositAccountId}
                  filterParams={{
                    isDeposit: true,
                    customerId: state.customerId,
                  }}
                  onSelect={(depositAccountId) => {
                    if (typeof depositAccountId === "string") {
                      setState((v) => ({
                        ...v,
                        ["depositAccountId"]: depositAccountId,
                      }));
                    }
                  }}
                  multi={false}
                  exactFilter={true}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__("Description")}</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentclass="textarea"
                  value={state.description || ""}
                  onChange={onChangeField}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__("Close")}
          </Button>

          {renderButton({
            name: "contract",
            values: generateDoc(values),
            disabled: !!Object.keys(checkValidation()).length,
            isSubmitted,
            object: props.contract,
          })}
        </ModalFooter>
      </>
    );
  };

  const renderGraphic = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeStartDate = (value) => {
      setState((v) => ({ ...v, startDate: value }));
    };

    const onChangeFirstPayDate = (value) => {
      setState((v) => ({ ...v, firstPayDate: value }));
    };

    const onSelectScheduleDays = (values) => {
      onChangeField({
        target: { name: "scheduleDays", value: values.map((val) => val.value) },
      });
    };

    const onChangeRow = (value, key, index) => {
      switch (key) {
        case "payDate":
          schedule[index].payDate = new Date(value);
          schedule[index].diffDay = Number(
            getDiffDay(
              new Date(schedule[index - 1]?.payDate ?? state.startDate),
              value
            ).toFixed(0)
          );
          if (schedule[index + 1]?.payDate)
            schedule[index + 1].diffDay = Number(
              getDiffDay(
                schedule[index].payDate,
                schedule[index + 1].payDate
              ).toFixed(0)
            );
          break;
        case "payment":
          schedule[index].payment = Number(value);
          break;
        case "interestNonce":
          schedule[index].interestNonce = Number(value);
          break;

        default:
          break;
      }
      setSchedule([...schedule]);
    };

    const scheduleOptions = new Array(31).fill(1).map((row, index) => ({
      value: row + index,
      label: row + index,
    }));

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__("Start Date")}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="startDate"
                    dateFormat="YYYY/MM/DD"
                    value={state.startDate}
                    onChange={onChangeStartDate}
                  />
                </DateContainer>
              </FormGroup>
              {renderFormGroup("Lease Amount", {
                type: "number",
                name: "leaseAmount",
                useNumberFormat: true,
                required: true,
                fixed: 2,
                value: state.leaseAmount || 0,
                errors: checkValidation(),
                onChange: onChangeField,
              })}
              {state.repayment === "custom" &&
                renderFormGroup("Skip Amount Calc /Month/", {
                  type: "number",
                  name: "skipAmountCalcMonth",
                  value: state.skipAmountCalcMonth,
                  onChange: onChangeField,
                })}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__("First Pay Date")}
                </ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="firstPayDate"
                    dateFormat="YYYY/MM/DD"
                    value={state.firstPayDate}
                    onChange={onChangeFirstPayDate}
                    isValidDate={(date) => {
                      const startDate = new Date(state.startDate);
                      const maxDate = moment(startDate).add(45, "day").toDate();

                      if (date > maxDate) return false;
                      if (startDate > date) return false;
                      return true;
                    }}
                  />
                </DateContainer>
              </FormGroup>
              {state.leaseType === LEASE_TYPES.FINANCE && (
                <FormGroup>
                  <ControlLabel required={true}>{__("Repayment")}</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="repayment"
                    componentclass="select"
                    value={state.repayment}
                    onChange={onChangeField}
                  >
                    {["fixed", "equal", "custom"].map((typeName) => (
                      <option key={typeName} value={typeName}>
                        {__(typeName + "Method")}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              )}
              {renderFormGroup("Tenor", {
                type: "number",
                name: "tenor",
                useNumberFormat: true,
                value: state.tenor || 0,
                errors: checkValidation(),
                required: true,
                max: config?.maxTenor,
                onChange: onChangeField,
              })}

              {state.repayment === "custom" &&
                renderFormGroup("Custom payment Amount", {
                  type: "number",
                  name: "customPayment",
                  useNumberFormat: true,
                  fixed: 2,
                  value: state.customPayment || 0,
                  onChange: onChangeField,
                })}
              {state.useSkipInterest &&
                renderFormGroup("Skip Interest Calc /Month/", {
                  type: "number",
                  name: "skipInterestCalcMonth",
                  value: state.skipInterestCalcMonth,
                  onChange: onChangeField,
                })}
              {state.leaseType === LEASE_TYPES.LINEAR &&
                renderFormGroup("Commitment interest", {
                  ...formProps,
                  type: "number",
                  useNumberFormat: true,
                  fixed: 2,
                  name: "commitmentInterest",
                  value: state.commitmentInterest || 0,
                  errors: checkValidation(),
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
            </FormColumn>
            <FormColumn>
              {state.leaseType === LEASE_TYPES.FINANCE && (
                <FormGroup>
                  <ControlLabel required>{__("Schedule Days")}</ControlLabel>
                  <Select
                    required
                    className="flex-item"
                    placeholder={__("Choose an schedule Days")}
                    value={scheduleOptions.filter((o) =>
                      state.scheduleDays?.includes(o.value)
                    )}
                    onChange={onSelectScheduleDays}
                    isMulti={true}
                    options={scheduleOptions}
                  />
                </FormGroup>
              )}
              {state.leaseType === LEASE_TYPES.SAVING && (
                <FormGroup>
                  <ControlLabel required={true}>{__("End Date")}</ControlLabel>
                  <DateContainer>
                    <DateControl
                      {...formProps}
                      required={false}
                      dateFormat="YYYY/MM/DD"
                      name="endDate"
                      value={state.endDate}
                    />
                  </DateContainer>
                </FormGroup>
              )}
              {renderFormGroup("Interest Rate", {
                ...formProps,
                type: "number",
                useNumberFormat: true,
                fixed: 2,
                name: "interestRate",
                value: state.interestRate || 0,
                errors: checkValidation(),
                onChange: onChangeField,
                onClick: onFieldClick,
              })}
              <FormGroup>
                <ControlLabel required={true}>
                  {__("Holiday type")}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="holidayType"
                  componentclass="select"
                  value={state.holidayType}
                  onChange={onChangeField}
                >
                  {["before", "exact", "after"].map((typeName, index) => (
                    <option key={typeName} value={typeName}>
                      {__(typeName + "Method")}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              {state.repayment === "custom" &&
                renderFormGroup("Custom Interest", {
                  ...formProps,
                  type: "number",
                  useNumberFormat: true,
                  fixed: 2,
                  name: "customInterest",
                  value: state.customInterest || 0,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
            </FormColumn>
          </FormWrapper>
          {state.repayment === "custom" && (
            <Table $striped>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ textAlign: "center" }}>{__("Day")}</th>
                  <th style={{ textAlign: "center" }}>{__("Schedule day")}</th>
                  <th style={{ textAlign: "center" }}>{__("Payment")}</th>
                  <th style={{ textAlign: "center" }}>{__("Interest")}</th>
                  <th style={{ textAlign: "center" }}>{__("Total")}</th>
                </tr>
              </thead>
              <tbody>
                {schedule?.map((mur, rowIndex) => {
                  if (rowIndex === changeRowIndex)
                    return (
                      <tr key={`schedule${mur.order}`}>
                        <td style={{ textAlign: "center" }}>{mur.order}</td>
                        <td style={{ textAlign: "center" }}>{mur.diffDay}</td>
                        <td style={{ textAlign: "center" }}>
                          <DateContainer>
                            <DateControl
                              required={false}
                              name="payDate"
                              dateFormat="YYYY/MM/DD"
                              value={mur.payDate}
                              onChange={(v) =>
                                onChangeRow(v, "payDate", rowIndex)
                              }
                            />
                          </DateContainer>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {renderFormGroup(undefined, {
                            type: "number",
                            useNumberFormat: true,
                            fixed: 2,
                            name: "payment",
                            value: mur.payment || 0,
                            onChange: (e) => {
                              onChangeRow(e.target.value, "payment", rowIndex);
                            },
                          })}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {renderFormGroup(undefined, {
                            type: "number",
                            useNumberFormat: true,
                            fixed: 2,
                            name: "interestNonce",
                            value: mur.interestNonce || 0,
                            onChange: (e) => {
                              onChangeRow(
                                e.target.value,
                                "interestNonce",
                                rowIndex
                              );
                            },
                          })}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span>{mur.total?.toLocaleString()}</span>
                          <Button
                            icon="check"
                            style={{ marginLeft: 10 }}
                            onClick={() => setChangeRowIndex(undefined)}
                          />
                        </td>
                      </tr>
                    );
                  return (
                    <tr key={`schedule${mur.order}`}>
                      <td style={{ textAlign: "center" }}>{mur.order}</td>
                      <td style={{ textAlign: "center" }}>{mur.diffDay}</td>
                      <td style={{ textAlign: "center" }}>
                        {mur.payDate.toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {mur.payment?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {mur.interestNonce?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span>{mur.total?.toLocaleString()}</span>

                        <Button
                          icon="edit"
                          style={{ marginLeft: 10 }}
                          onClick={() => setChangeRowIndex(rowIndex)}
                        />
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: "center" }}>{schedule.length}</td>
                  <td style={{ textAlign: "center" }}>
                    {schedule
                      .reduce((a, b) => a + Number(b.payment), 0)
                      .toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {schedule
                      .reduce((a, b) => a + Number(b.interestNonce || 0), 0)
                      .toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {schedule
                      .reduce((a, b) => a + Number(b.total), 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </Table>
          )}
        </ScrollWrapper>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__("Close")}
          </Button>

          {renderButton({
            name: "contract",
            values: generateDoc(values),
            disabled: !!Object.keys(checkValidation()).length,
            isSubmitted,
            object: props.contract,
          })}
        </ModalFooter>
      </>
    );
  };

  const { change } = props;
  if (change) return <Form renderContent={renderGraphic} />;
  return (
    <Tabs
      tabs={[
        {
          label: "Гэрээ",
          component: <Form renderContent={renderContent} />,
        },
        {
          label: "Хуваарь",
          component: <Form renderContent={renderGraphic} />,
        },
      ]}
    />
  );
}

export default ContractForm;
