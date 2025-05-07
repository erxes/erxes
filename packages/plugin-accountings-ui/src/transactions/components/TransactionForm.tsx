import { EmptyContent } from "@erxes/ui-log/src/activityLogs/styles";
import { Alert, Button, Icon, Wrapper, __ } from "@erxes/ui/src";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Spinner from "@erxes/ui/src/components/Spinner";
import {
  ControlWrapper,
  Indicator,
} from "@erxes/ui/src/components/step/styles";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";
import Tip from "@erxes/ui/src/components/Tip";
import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import { IQueryParams } from "@erxes/ui/src/types";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TR_SIDES } from "../../constants";
import { IConfigsMap } from "../../settings/configs/types";
import { Box } from "../../styles";
import AddTransactionLink from "../components/AddTr";
import {
  ContentWrapper,
  DeleteIcon,
  FormContent,
  FormContentHeader,
  TransactionLinkWrapper,
} from "../styles";
import { ITransaction } from "../types";
import { journalConfigMaps } from "../utils/maps";
import { TRS } from "../utils/transactions";
import TrFormTBalance from "./TrFormTBalance";

type Props = {
  configsMap: IConfigsMap;
  transactions?: ITransaction[];
  defaultJournal?: string;
  loading?: boolean;
  save: (params: any) => void;
  deletePtr: () => void;
  queryParams: IQueryParams;
  parentId?: string;
};

type State = {
  date: Date;
  number: string;
};

const TransactionForm = (props: Props) => {
  const {
    parentId,
    configsMap,
    queryParams,
    transactions,
    defaultJournal,
    loading,
    save,
    deletePtr,
  } = props;

  const [state, setState] = useState<State>({
    date: (transactions?.length && transactions[0].date) || new Date(),
    number: (transactions?.length && transactions[0].number) || "",
  });

  const [trDocs, setTrDocs] = useState<ITransaction[]>(
    transactions?.length
      ? transactions.filter((tr) => !tr.originId)
      : (defaultJournal && [
        journalConfigMaps[defaultJournal || ""]?.defaultData(state.date),
      ]) ||
      []
  );

  const [followTrDocs, setFollowTrDocs] = useState<ITransaction[]>(
    (transactions?.length && transactions.filter((tr) => tr.originId)) || []
  );

  useEffect(() => {
    const leastSavingTr = transactions?.find(tr => !tr._id?.includes('temp'))
    if (!leastSavingTr) {
      return;
    }

    setTrDocs(
      (transactions || []).filter((tr) => !tr.originId)
    );
    setFollowTrDocs(
      (transactions || []).filter((tr) => tr.originId)
    );
  }, [transactions]);

  const [currentTransaction, setCurrentTransaction] = useState(
    queryParams.trId && trDocs.find((tr) => tr._id === queryParams.trId) || trDocs[0]
  );

  const balance: { dt: number; ct: number; diff?: number; side?: string } =
    useMemo(() => {
      const result = { dt: 0, ct: 0 };

      [...trDocs, ...followTrDocs].forEach((tr) => {
        let sumDt = 0;
        let sumCt = 0;
        (tr.details || []).forEach((detail) => {
          if (detail.side === TR_SIDES.DEBIT) {
            sumDt += Number(detail.amount) ?? 0;
          } else {
            sumCt += Number(detail.amount) ?? 0;
          }
        });

        result.dt += sumDt;
        result.ct += sumCt;
      });

      const diff = result.dt - result.ct;
      if (diff > 0.05 && diff < 0.05) {
        return result;
      }

      if (diff > 0) {
        return { ...result, side: TR_SIDES.CREDIT, diff };
      }
      return { ...result, side: TR_SIDES.DEBIT, diff: -1 * diff };
    }, [trDocs]);

  const handleDelete = (e) => {
    e.preventDefault();
    deletePtr();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    save(trDocs);
  };

  const renderButtons = () => {
    const cancelButton = (
      <Link to={`/accountings/ptrs`}>
        <Button btnStyle="simple" icon="times-circle" size="small">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        {parentId && (
          <Button
            btnStyle="danger"
            icon={"trash-alt"}
            size="small"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}

        <Button
          btnStyle="success"
          icon={"check-circle"}
          size="small"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </Button.Group>
    );
  };

  const onAddTr = (journal) => {
    if (!journalConfigMaps[journal]) {
      return Alert.error("wron cho");
    }
    const trData = journalConfigMaps[journal]?.defaultData(
      state.date,
      balance.diff
    );
    trDocs?.push(trData);
    setTrDocs(trDocs);
    setCurrentTransaction(trData);
  };

  const onRemoveTr = (id) => {
    setTrDocs(trDocs.filter((tr) => tr._id !== id));
    setFollowTrDocs(followTrDocs.filter((tr) => tr.originId !== id));
    if (currentTransaction?._id === id) {
      setCurrentTransaction(trDocs[0]);
    }
    if (!currentTransaction && trDocs.length) {
      setCurrentTransaction(trDocs[0]);
    }
  };

  const onEditTr = (trDoc: ITransaction, fTrDocs?: ITransaction[]) => {
    setTrDocs(
      trDocs.map((tr) => {
        if (tr._id === trDoc._id) {
          return { ...tr, ...trDoc };
        } else {
          return { ...tr };
        }
      })
    );

    const oldFollowTrs = followTrDocs.filter(
      (ftr) => ftr.originId === trDoc._id
    );

    if (!oldFollowTrs.length && !fTrDocs?.length) {
      return;
    }

    const oldFollowTrIds = oldFollowTrs.map((oftr) => oftr._id);
    const addFtrs = (fTrDocs || []).filter(
      (ftr) => !oldFollowTrIds.includes(ftr._id)
    );

    let tempFollowTrs: ITransaction[] = [];
    for (const ftrDoc of followTrDocs) {
      if (ftrDoc.originId === trDoc._id) {
        const currentDoc = fTrDocs?.find((ftr) => ftr._id === ftrDoc._id);
        // found and edit else remove
        if (currentDoc) {
          tempFollowTrs.push({ ...ftrDoc, ...currentDoc });
        }
      } else {
        tempFollowTrs.push(ftrDoc);
      }
    }

    for (const addFtr of addFtrs) {
      tempFollowTrs.push(addFtr);
    }

    setFollowTrDocs(tempFollowTrs);
  };

  const renderEmptyBox = (text, image) => {
    return (
      <Box>
        <EmptyContent>
          <EmptyState text={__(text)} image={`/images/actions/${image}.svg`} />
        </EmptyContent>
      </Box>
    );
  };

  const renderTabContent = () => {
    if (!currentTransaction) {
      return renderEmptyBox(
        "Уучлаарай. Идэвхитэй баримт сонгогдоогүй байна. Зөв табаа сонгоно уу.",
        "30"
      );
    }

    if (currentTransaction._id === "TBalance") {
      return (
        <Box key={currentTransaction._id}>
          <TrFormTBalance
            balance={balance}
            queryParams={queryParams}
            transactions={[...(trDocs || []), ...(followTrDocs || [])]}
          />
        </Box>
      );
    }

    if (currentTransaction.permission === "hidden") {
      return renderEmptyBox(
        "Уучлаарай. Таны эрх уг гүйлгээг удирдах эрх хүрсэнгүй",
        "automation2"
      );
    }

    const Component = journalConfigMaps[currentTransaction?.journal]?.component;

    const trDoc = trDocs.find((tr) => tr._id === currentTransaction._id);
    if (!trDoc) {
      return renderEmptyBox(
        "Уучлаарай. Идэвхитэй баримт сонгогдоогүй байна. Зөв табаа сонгоно уу.",
        "30"
      );
    }

    const originTrs = trDocs.filter(
      (tr) => tr.originId === currentTransaction._id
    );
    return (
      <Box key={currentTransaction._id}>
        <Component
          key={currentTransaction._id}
          configsMap={configsMap}
          transactions={originTrs}
          trDoc={trDoc}
          followTrDocs={followTrDocs.filter((tr) => tr.originId === trDoc._id)}
          setTrDoc={onEditTr}
        />
      </Box>
    );
  };

  const breadcrumb = [
    { title: "Transactions", link: `/accountings/ptrs` },
    { title: "Form" },
  ];

  const onChangeDate = (date) => {
    setState((prevState) => ({
      ...prevState,
      date,
    }));

    setTrDocs(trDocs.map((tr) => ({ ...tr, date })));
    setFollowTrDocs(followTrDocs.map((tr) => ({ ...tr, date })));
  };

  const content = () => {
    return (
      <ContentWrapper>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__("Number")}</ControlLabel>
              <FormControl
                name="number"
                value={state.number}
                autoFocus={true}
                required={true}
                onChange={(e) =>
                  setState((prevState) => ({
                    ...prevState,
                    number: (e.target as any).value,
                  }))
                }
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__("Date")}</ControlLabel>
              <DateControl
                required={true}
                value={state.date}
                name={"date"}
                placeholder="Enter date"
                dateFormat="YYYY-MM-DD"
                onChange={onChangeDate}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormContent>
          <FormContentHeader>
            <Tabs grayBorder={true}>
              {(trDocs || []).map((tr) => (
                <TabTitle
                  key={tr._id}
                  className={currentTransaction?._id === tr._id ? "active" : ""}
                  onClick={() => setCurrentTransaction(tr)}
                >
                  {TRS[tr.journal]?.value} - {(tr.details || [])[0]?.side}
                  <DeleteIcon onClick={(e) => e.stopPropagation()}>
                    <Tip text={__("Delete")}>
                      <Icon
                        color="#EA475D"
                        icon="trash-alt"
                        onClick={onRemoveTr.bind(this, tr._id)}
                      ></Icon>
                    </Tip>
                  </DeleteIcon>
                </TabTitle>
              ))}
              <TabTitle
                className={
                  currentTransaction?._id === "TBalance" ? "active" : ""
                }
                onClick={() =>
                  setCurrentTransaction({
                    ...currentTransaction,
                    _id: "TBalance",
                  })
                }
              >
                <Icon icon={"alignright"}></Icon>T balance
              </TabTitle>
              <TabTitle>
                <TransactionLinkWrapper>
                  <AddTransactionLink onClick={onAddTr} />
                </TransactionLinkWrapper>
              </TabTitle>
            </Tabs>
            {renderButtons()}
          </FormContentHeader>
          {renderTabContent()}
        </FormContent>

        <ControlWrapper>
          <Indicator>
            <>
              {__("You are")}{" "}
              {currentTransaction?.parentId ? "editing" : "creating"}{" "}
              {__("transaction")}.
            </>
            <>
              {" "}
              {__("Sum Debit")}:{" "}
              <strong>{(balance.dt ?? 0).toLocaleString()}</strong>;
            </>
            <>
              {" "}
              {__("Sum Credit")}:{" "}
              <strong>{(balance.ct ?? 0).toLocaleString()}</strong>;
            </>
            {(balance?.diff && (
              <>
                {" "}
                + {__(balance.side || "")}: <strong>{balance.diff}</strong>;
              </>
            )) ||
              ""}
          </Indicator>
          save template
        </ControlWrapper>
      </ContentWrapper>
    );
  };

  if (loading) {
    return <Spinner objective={true} />;
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__("Transaction")} breadcrumb={breadcrumb} />
      }
      content={content()}
    />
  );
};

export default TransactionForm;
