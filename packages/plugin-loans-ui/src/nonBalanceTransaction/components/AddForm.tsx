import {
  Button,
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  __,
} from "@erxes/ui/src";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import {
  INonBalanceDetail,
  INonBalanceTransaction,
  INonBalanceTransactionDoc,
} from "../types";
import { DateContainer } from "@erxes/ui/src/styles/main";
import React from "react";
import SelectContracts, {
  Contracts,
} from "../../contracts/components/common/SelectContract";
import Select from "react-select";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  nonBalanceTransaction: INonBalanceTransaction;
  closeModal: () => void;
};

type State = {
  contractId: string;
  customerId: string;
  description: string;
  number: string;
  detail: INonBalanceDetail;
  isDedit: boolean;
  amount: number;
  detailType: string;
  currency: string;
  detailTypeList: any;
};

class AddTransactionForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { nonBalanceTransaction = {}, transactionType } = props;

    this.state = {
        contractId: nonBalanceTransaction.contractId || '',
        customerId: nonBalanceTransaction.customerId || '',
        description: nonBalanceTransaction.description || '',
        number: nonBalanceTransaction.number || '',
        detail: nonBalanceTransaction.detail || [],
        isDedit: false,
        detailType:  nonBalanceTransaction.detail?.detailType || '',
        amount: 0,
        currency: nonBalanceTransaction.detail?.currency || '',
        detailTypeList: [
          {
            value: 'interest',
            label: 'interest'
          },
          {
            value: 'stoppedInterest',
            label: 'stoppedInterest'
          },
          {
            value: 'storedInterest',
            label: 'storedInterest'
          },
          {
            value: 'allOfInterest',
            label: 'stoppedInterest && storedInterest'
          },
          {
            value: 'loan',
            label: 'loan'
          },{
            value: 'collateral',
            label: 'collateral'
          }
      ] 
      };
      
  }

  generateDoc = (values: { _id: string } & INonBalanceTransactionDoc) => {
   
    const finalValues = values;
    let addDetail: any = {};
    addDetail.currency = this.state.currency;
    addDetail.dtAmount = this.state.isDedit ? this.state.amount : 0;
    addDetail.ktAmount = !this.state.isDedit ? this.state.amount : 0;
    addDetail.type = this.state.detailType;
    addDetail.currency = this.state.currency || "";
    finalValues.contractId = this.state.contractId || "";
    finalValues.customerId = this.state.customerId || "";
    finalValues.description = this.state.description;
    finalValues.transactionType =  this.state.description || 'loan';
    finalValues.detail = [addDetail];
    return finalValues;
  };

  onFieldClick = (e) => {
    e.target.select();
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as any);
    };

    const onchangeType = (value, name) => {
      this.setState({ ["detailType"]: value.value } as any);
    };

    const onChangeField = (e) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;

      const { name } = e.target as HTMLInputElement;
      this.setState({
        [name]: value,
      } as any);
    };

    const detailTypeOptions = this.state.detailTypeList.map((f) => ({
      value: f.value,
      label: f.label,
    }));

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__("Contract")}</ControlLabel>
                <SelectContracts
                  label={__("Choose an contract")}
                  name="contractId"
                  initialValue={this.state.contractId}
                  onSelect={(v, n) => {
                    onSelect(v, n);
                    if (typeof v === "string") {
                      onSelect(Contracts[v].customerId, "customerId");
                      onSelect(Contracts[v].currency, "currency");
                    }
                  }}
                  multi={false}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("type")}</ControlLabel>
                <Select
                  placeholder={__("Choose detail type")}
                  name="detailType"
                  options={detailTypeOptions}
                  value={detailTypeOptions.find(
                    (o) => o.value === this.state.detailType
                  )}
                  onChange={onchangeType}
                  isMulti={false}
                  isClearable={true}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("Is debit")}</ControlLabel>
                <FormControl
                  {...formProps}
                  type={"checkbox"}
                  componentclass="checkbox"
                  useNumberFormat
                  fixed={0}
                  name="isDedit"
                  value={this.state.isDedit}
                  onChange={onChangeField}
                  onClick={this.onFieldClick}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("Amount")}</ControlLabel>
                <FormControl
                  {...formProps}
                  type={"number"}
                  useNumberFormat
                  fixed={2}
                  name="amount"
                  onChange={onChangeField}
                  onClick={this.onFieldClick}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__("Description")}</ControlLabel>
                <DateContainer>
                  <FormControl
                    {...formProps}
                    required={false}
                    name="description"
                    value={this.state.description}
                    onChange={onChangeField}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={() => closeModal()}
            icon="cancel-1"
          >
            {__("Close")}
          </Button>
          {renderButton({
            name: "nonBalanceTransaction",
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.nonBalanceTransaction,
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default AddTransactionForm;
