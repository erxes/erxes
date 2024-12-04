import {
  ControlLabel,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from "@erxes/ui/src";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { ITransaction } from "../types";
import Button from "@erxes/ui/src/components/Button";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import Form from "@erxes/ui/src/components/form/Form";

import { Amount } from "../../contracts/styles";
import { DateContainer } from "@erxes/ui/src/styles/main";
import React, { useEffect, useMemo, useState } from "react";
import { __ } from "coreui/utils";
import SelectContracts from "../../contracts/components/common/SelectContract";
import client from "@erxes/ui/src/apolloClient";
import { gql } from "@apollo/client";
import { queries } from "../graphql";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  transaction: ITransaction;
  contractId?: string;
  lockContract?: boolean;
  type: string;
  closeModal: () => void;
};

type PaymentInfo = {
  payment: number;
  loss: number;
  insurance: number;
  debt: number;
  total: number;
  balance: number;
  closeAmount: number;
  calcInterest: number;
  commitmentInterest: number;
  storedInterest: number;
};

const getValue = (mustPay, value) => {
  let change = 0;
  if (mustPay > value) return { value, change };
  else if (value > mustPay) {
    change = value - mustPay;
    return { value: mustPay, change };
  }
  return { value, change };
};

function TransactionFormNew(props: Props) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | undefined>();

  const [contractId, setContractId] = useState<string | undefined>(
    props.contractId
  );
  const [isPrePayment, setIsPrePayment] = useState<boolean>();
  const [payDate, setPayDate] = useState(new Date());
  const [calcDate, setCalcDate] = useState(new Date());
  const [description, setDescription] = useState<string>("");

  const [total, setTotal] = useState(0);
  const [payment, setPayment] = useState(0);
  const [storedInterest, setStoredInterest] = useState(0);
  const [calcInterest, setCalcInterest] = useState(0);
  const [loss, setLoss] = useState(0);
  const [commitmentInterest, setCommitmentInterest] = useState(0);

  useEffect(() => {
    contractId &&
      client
        .query({
          query: gql(queries.getPaymentInfo),
          variables: {
            id: contractId,
            scheduleDate: calcDate,
            payDate: payDate
          }
        })
        .then(({ data }) => {
          setPaymentInfo({ ...data.getPaymentInfo });
        });
  }, [contractId, calcDate, payDate]);

  const onChangeValue = (key: string, value: number, setValue: any) => {
    switch (key) {
      case "total":
        if (paymentInfo) {
          let total = value;
          const loss = getValue(paymentInfo.loss, total);
          total = loss.change;
          if (loss.value >= 0) setLoss(loss.value);

          const storedInterest = getValue(paymentInfo.storedInterest, total);
          total = storedInterest.change;
          if (storedInterest.value >= 0) {
            setStoredInterest(storedInterest.value);
          }

          const calcInterest = getValue(paymentInfo.calcInterest, total);
          total = calcInterest.change;
          if (calcInterest.value >= 0) setCalcInterest(calcInterest.value);

          const commitmentInterest = getValue(
            paymentInfo.commitmentInterest,
            total
          );
          total = commitmentInterest.change;
          if (commitmentInterest.value >= 0)
            setCommitmentInterest(commitmentInterest.value);

          setPayment(total);
        }

        break;
      case "payment":
        setTotal(
          value + storedInterest + calcInterest + loss + commitmentInterest
        );
        break;
      case "storedInterest":
        setTotal(payment + value + calcInterest + loss + commitmentInterest);
        break;
      case "calcInterest":
        setTotal(payment + storedInterest + value + loss + commitmentInterest);
        break;
      case "loss":
        setTotal(
          payment + storedInterest + calcInterest + value + commitmentInterest
        );
        break;
      case "commitmentInterest":
        setTotal(payment + storedInterest + calcInterest + loss + value);
        break;
      default:
        break;
    }

    setValue(value);
  };

  const doc = useMemo(() => {
    return {
      contractId,
      transactionType: props.type,
      isManual: true,
      payDate,
      total,
      payment,
      storedInterest,
      calcInterest,
      loss,
      commitmentInterest
    };
  }, [
    contractId,
    total,
    payment,
    storedInterest,
    calcInterest,
    loss,
    commitmentInterest,
    description,
    payDate
  ]);

  const renderRowTr = (label, key, value, onChange, main, max?: number) => {
    if (!paymentInfo || !key || !paymentInfo?.[key]) return "";

    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${__(label)}:`}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(paymentInfo[key]).toLocaleString()}</Amount>
        </FormColumn>
        <FormColumn>
          <FormControl
            type={"number"}
            useNumberFormat
            fixed={2}
            name="total"
            max={max || main}
            value={value?.toString()}
            onChange={(e: any) =>
              onChangeValue(key, Number(e.target.value), onChange)
            }
            onDoubleClick={() => onChangeValue(key, main, onChange)}
          />
        </FormColumn>
      </FormWrapper>
    );
  };

  return (
    <Form
      renderContent={({ isSubmitted }: IFormProps) => (
        <>
          <ScrollWrapper>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__("Pay Date")}</ControlLabel>
                  <DateControl
                    required={true}
                    name="payDate"
                    dateFormat="YYYY/MM/DD"
                    value={payDate}
                    onChange={(value: any) => {
                      setPayDate(value);
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{__("Is Pre Payment")}</ControlLabel>
                  <FormControl
                    type={"checkbox"}
                    componentclass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isPrePayment"
                    checked={isPrePayment}
                    onChange={(e: any) => {
                      setIsPrePayment(e.target.checked);
                      if (!e.target.checked) {
                        setCalcDate(payDate);
                      }
                    }}
                  />
                </FormGroup>
                {isPrePayment && (
                  <FormGroup>
                    <ControlLabel>{__("Calc Date")}</ControlLabel>
                    <DateContainer>
                      <DateControl
                        required={false}
                        name="payDate"
                        dateFormat="YYYY/MM/DD"
                        value={calcDate}
                        onChange={(value: any) => {
                          setCalcDate(value);
                        }}
                      />
                    </DateContainer>
                  </FormGroup>
                )}
                <FormGroup>
                  <ControlLabel>{__("Contract")}</ControlLabel>
                  <SelectContracts
                    label={__("Choose an contract")}
                    name="contractId"
                    initialValue={contractId}
                    onSelect={(v) => {
                      if (typeof v === "string") {
                        setContractId(v);
                      }
                    }}
                    multi={false}
                    filterParams={props.lockContract && { _ids: [contractId], excludeIds: false } || undefined}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{__("Description")}</ControlLabel>
                  <DateContainer>
                    <FormControl
                      required={false}
                      name="description"
                      value={description}
                      onChange={(e: any) => setDescription(e.target.value)}
                    />
                  </DateContainer>
                </FormGroup>
                {paymentInfo && (
                  <>
                    <FormWrapper>
                      <FormColumn>
                        <ControlLabel>{__("Type")}</ControlLabel>
                      </FormColumn>
                      <FormColumn>
                        <ControlLabel>Must pay</ControlLabel>
                      </FormColumn>
                      <FormColumn>
                        <ControlLabel>Amount</ControlLabel>
                      </FormColumn>
                    </FormWrapper>

                    {renderRowTr(
                      "Payment",
                      "payment",
                      payment,
                      setPayment,
                      paymentInfo.payment,
                      paymentInfo.balance
                    )}
                    {renderRowTr(
                      "Stored Interest",
                      "storedInterest",
                      storedInterest,
                      setStoredInterest,
                      paymentInfo.storedInterest
                    )}
                    {renderRowTr(
                      "Calc Interest",
                      "calcInterest",
                      calcInterest,
                      setCalcInterest,
                      paymentInfo.calcInterest
                    )}

                    {renderRowTr(
                      "Commitment interest",
                      "commitmentInterest",
                      commitmentInterest,
                      setCommitmentInterest,
                      paymentInfo.commitmentInterest
                    )}
                    {renderRowTr(
                      "Loss",
                      "loss",
                      loss,
                      setLoss,
                      paymentInfo.loss
                    )}
                    {renderRowTr(
                      "Total must pay",
                      "total",
                      total,
                      setTotal,
                      paymentInfo.total,
                      paymentInfo.closeAmount
                    )}
                  </>
                )}
              </FormColumn>
            </FormWrapper>
          </ScrollWrapper>

          <ModalFooter>
            <Button
              btnStyle="simple"
              onClick={props.closeModal}
              icon="cancel-1"
            >
              {__("Close")}
            </Button>

            {props.renderButton({
              name: "transaction",
              values: doc,
              isSubmitted,
              object: props.transaction
            })}
          </ModalFooter>
        </>
      )}
    />
  );
}

export default TransactionFormNew;
