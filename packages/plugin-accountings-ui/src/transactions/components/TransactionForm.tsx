import { EmptyContent } from "@erxes/ui-log/src/activityLogs/styles";
import { LeftContent } from "@erxes/ui-settings/src/styles";
import { __, Alert, Button, ButtonMutate, Icon, Wrapper } from "@erxes/ui/src";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
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
import {
  Actions,
  FormColumn,
  FormWrapper,
  InfoWrapper,
  ModalFooter,
  PopoverButton,
  PopoverHeader,
} from "@erxes/ui/src/styles/main";
import { IQueryParams } from "@erxes/ui/src/types";
import { Popover } from "@headlessui/react";
import { format } from "date-fns";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ITransaction } from "../types";
import { journalConfigMaps } from "../utils/maps";
import AddTransactionLink from "../containers/AddTr";
import { Box } from "../../styles";
import { TR_SIDES } from "../../constants";
import { ContentHeader, HeaderContent, HeaderItems } from "@erxes/ui/src/layout/styles";
import TrFormTBalance from "./TrFormTBalance";

type Props = {
  transactions?: ITransaction[];
  defaultJournal?: string;
  parentId?: string;
  loading?: boolean;
  save: (params: any) => ITransaction[];
  queryParams: IQueryParams;
};

type State = {
  firstTransaction?: ITransaction;
  date: Date;
  number: string;
};

const TransactionForm = (props: Props) => {
  const {
    queryParams,
    transactions,
    defaultJournal,
    loading,

    save,
  } = props;

  const [state, setState] = useState<State>({
    firstTransaction: transactions?.find(
      (tr) => tr._id === tr.parentId
    ) as ITransaction,
    date:
      transactions?.find((tr) => tr._id === tr.parentId)?.date || new Date(),
    number: transactions?.find((tr) => tr._id === tr.parentId)?.number || "",
  });

  const [trDocs, setTrDocs] = useState<ITransaction[]>(
    transactions && transactions.length && [...transactions] ||
    (defaultJournal && [
      journalConfigMaps[defaultJournal || ""]?.defaultData(state.date),
    ]) ||
    []
  );
  const [currentTransaction, setCurrentTransaction] = useState(
    trDocs && (trDocs.find((tr) => tr._id === queryParams.trId) || trDocs[0])
  );

  const getBalance = () => {
    const result = { dt: 0, ct: 0 };

    trDocs.forEach((tr) => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trs = save(trDocs);

    setTrDocs(trs.filter(tr => !tr.originId));
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
    const trData = journalConfigMaps[journal]?.defaultData(state.date);
    trDocs?.push(trData);
    setTrDocs(trDocs);
    setCurrentTransaction(trData);
  };

  const onRemoveTr = (id) => {
    setTrDocs(trDocs.filter((tr) => tr._id !== id));
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
            transactions={trDocs}
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

    const transactions = trDocs.filter(
      (tr) => tr.originId === currentTransaction._id
    )
    return (
      <Box key={currentTransaction._id}>
        <Component
          key={currentTransaction._id}
          transactions={transactions}
          trDoc={trDoc}
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

  const balance: { dt: number; ct: number; diff?: number; side?: string } =
    getBalance();

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
                  value={state.number || ''}
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
                  value={state.date || new Date()}
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
                      {__(tr.journal)}
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
