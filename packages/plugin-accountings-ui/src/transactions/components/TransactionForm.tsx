import { EmptyContent } from "@erxes/ui-log/src/activityLogs/styles";
import { LeftContent } from "@erxes/ui-settings/src/styles";
import { __, Alert, Button, ButtonMutate, Icon, Wrapper } from "@erxes/ui/src";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import {
  ControlWrapper,
  Indicator,
  StepWrapper,
} from "@erxes/ui/src/components/step/styles";
import { Tabs, TabTitle } from "@erxes/ui/src/components/tabs";
import { ContentHeader, HeaderContent, HeaderItems } from "@erxes/ui/src/layout/styles";
import {
  FormColumn,
  FormWrapper,
} from "@erxes/ui/src/styles/main";
import { IQueryParams } from "@erxes/ui/src/types";
import { Popover } from "@headlessui/react";
import { format } from "date-fns";
import dayjs from "dayjs";
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { TR_SIDES } from "../../constants";
import { IAccount } from "../../settings/accounts/types";
import { Box } from "../../styles";
import AddTransactionLink from "../containers/AddTr";
import { ITransaction } from "../types";
import { journalConfigMaps } from "../utils/maps";
import TrFormTBalance from "./TrFormTBalance";
import { IConfigsMap } from "../../settings/configs/types";

type Props = {
  configsMap: IConfigsMap;
  transactions?: ITransaction[];
  defaultJournal?: string;
  parentId?: string;
  loading?: boolean;
  save: (params: any) => void;
  queryParams: IQueryParams;
};

type State = {
  date: Date;
  number: string;
};

const TransactionForm = (props: Props) => {
  const {
    configsMap,
    queryParams,
    transactions,
    defaultJournal,
    loading,
    save,
  } = props;

  const [state, setState] = useState<State>({
    date:
      transactions?.length && transactions[0].date || new Date(),
    number: transactions?.length && transactions[0].number || "",
  });

  const [trDocs, setTrDocs] = useState<ITransaction[]>(
    transactions?.length && transactions.filter(tr => !tr.originId) ||
    (defaultJournal && [
      journalConfigMaps[defaultJournal || ""]?.defaultData(state.date),
    ]) ||
    []
  );

  const [followTrDocs, setFollowTrDocs] = useState<ITransaction[]>(
    transactions?.length && transactions.filter(tr => tr.originId) || []
  )

  const [currentTransaction, setCurrentTransaction] = useState(
    trDocs && (trDocs.find((tr) => tr._id === queryParams.trId) || trDocs[0])
  );

  const balance: { dt: number; ct: number; diff?: number; side?: string } = useMemo(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    save(trDocs);
  };

  const renderButtons = () => {
    const SmallLoader = ButtonMutate.SmallLoader;

    const cancelButton = (
      <Link to={`/accountings/ptrs`}>
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button btnStyle="success" icon={"check-circle"} onClick={handleSubmit}>
          Save
        </Button>
      </Button.Group>
    );
  };

  const onAddTr = (journal) => {
    if (!journalConfigMaps[journal]) {
      return Alert.error("wron cho");
    }
    const trData = journalConfigMaps[journal]?.defaultData(state.date, balance.diff);
    trDocs?.push(trData);
    setTrDocs(trDocs);
    setCurrentTransaction(trData);
  };

  const onRemoveTr = (id) => {
    setTrDocs(trDocs.filter((tr) => tr._id !== id));
    setFollowTrDocs(followTrDocs.filter(tr => tr.originId !== id));
    if (currentTransaction?._id === id) {
      setCurrentTransaction(trDocs[0]);
    }
    if (!currentTransaction && trDocs.length) {
      setCurrentTransaction(trDocs[0]);
    }
  };

  const onEditTr = (trDoc: ITransaction) => {
    setTrDocs(
      trDocs.map((tr) => {
        if (tr._id === trDoc._id) {
          return { ...tr, ...trDoc };
        } else {
          return { ...tr };
        }
      })
    );
  };

  const renderEmptyBox = (text, image) => {
    return (
      <Box>
        <EmptyContent>
          <EmptyState
            text={__(text)}
            image={`/images/actions/${image}.svg`}
          />
        </EmptyContent>
      </Box>
    )
  }
  const renderTabContent = () => {
    if (!currentTransaction) {
      return renderEmptyBox('Уучлаарай. Идэвхитэй баримт сонгогдоогүй байна. Зөв табаа сонгоно уу.', '30')
    }

    if (currentTransaction._id === 'TBalance') {
      return (
        <Box key={currentTransaction._id}>
          <TrFormTBalance
            balance={balance}
            queryParams={queryParams}
            transactions={transactions || []}
          />
        </Box>
      )
    }

    if (currentTransaction.permission === "hidden") {
      return renderEmptyBox('Уучлаарай. Таны эрх уг гүйлгээг удирдах эрх хүрсэнгүй', 'automation2');
    }

    const Component = journalConfigMaps[currentTransaction?.journal]?.component;
    const trDoc = trDocs.find((tr) => tr._id === currentTransaction._id)
    if (!trDoc) {
      return renderEmptyBox('Уучлаарай. Идэвхитэй баримт сонгогдоогүй байна. Зөв табаа сонгоно уу.', '30')
    }

    const originTrs = trDocs.filter(
      (tr) => tr.originId === currentTransaction._id
    )
    return (
      <Box key={currentTransaction._id}>
        <Component
          key={currentTransaction._id}
          configsMap={configsMap}
          transactions={originTrs}
          trDoc={trDoc}
          followTrDocs={followTrDocs.filter(tr => tr.originId === trDoc._id)}
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
  };

  const content = () => {
    return (
      <StepWrapper>
        <LeftContent>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Number')}</ControlLabel>
                <FormControl
                  name="number"
                  value={state.number}
                  autoFocus={true}
                  required={true}
                  onChange={e => setState((prevState) => ({
                    ...prevState, number: (e.target as any).value
                  }))}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Date')}</ControlLabel>
                <DateControl
                  required={true}
                  value={state.date}
                  name={'date'}
                  placeholder="Enter date"
                  dateFormat='YYYY-MM-DD'
                  onChange={onChangeDate}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <ContentHeader
            background={'colorWhite'}
          >
            <HeaderContent>
              <HeaderItems $hasFlex={true}>
                <Tabs grayBorder={true}>
                  {(trDocs || []).map(tr => (
                    <TabTitle
                      key={tr._id}
                      className={currentTransaction?._id === tr._id ? 'active' : ''}
                      onClick={() => setCurrentTransaction(tr)}
                    >
                      {__(tr.journal.toUpperCase())} - {(tr.details || [])[0]?.side}.
                      <span onClick={(e) => e.stopPropagation()}>
                        <Icon icon='trash-alt' onClick={onRemoveTr.bind(this, tr._id)}>
                        </Icon>
                      </span>
                    </TabTitle>
                  ))}
                  <TabTitle
                    className={currentTransaction?._id === 'TBalance' ? 'active' : ''}
                    onClick={() => setCurrentTransaction({ ...currentTransaction, _id: 'TBalance' })}
                  >
                    <Icon icon={'alignright'}></Icon>
                    T balance
                  </TabTitle>
                  <TabTitle>
                    <AddTransactionLink onClick={onAddTr} />
                  </TabTitle>
                </Tabs>
              </HeaderItems>
              <HeaderItems $rightAligned={true}>
                {renderButtons()}
              </HeaderItems>
            </HeaderContent>
          </ContentHeader>
          {renderTabContent()}

          <ControlWrapper>
            <Indicator>
              <>{__('You are')} {currentTransaction?.parentId ? 'editing' : 'creating'} {__('transaction')}.</>
              <> {__('Sum Debit')}: <strong>{(balance.dt ?? 0).toLocaleString()}</strong>;</>
              <> {__('Sum Credit')}: <strong>{(balance.ct ?? 0).toLocaleString()}</strong>;</>
              {balance?.diff && (<> + {__(balance.side || '')}: <strong>{balance.diff}</strong>;</>) || ''}

            </Indicator>
            save template
          </ControlWrapper>
        </LeftContent>
      </StepWrapper >
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Transaction')} breadcrumb={breadcrumb} />
      }
      content={content()}
      hasBorder={true}
    />
  );
};

export default TransactionForm;
