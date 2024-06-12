import { Box } from '@erxes/ui-contacts/src/customers/styles';
import { EmptyContent } from "@erxes/ui-log/src/activityLogs/styles";
import { LeftContent } from '@erxes/ui-settings/src/styles';
import {
  __,
  Alert,
  Button,
  ButtonMutate,
  Icon,
  Wrapper,
} from '@erxes/ui/src';
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  ControlWrapper,
  Indicator,
  StepWrapper,
} from '@erxes/ui/src/components/step/styles';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import {
  Actions, FormColumn,
  FormWrapper, InfoWrapper, ModalFooter, PopoverButton, PopoverHeader
} from "@erxes/ui/src/styles/main";
import { IQueryParams } from '@erxes/ui/src/types';
import { Popover } from '@headlessui/react';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ITransaction } from '../types';
import { journalConfigMaps } from '../utils/maps';

type Props = {
  transactions?: ITransaction[];
  defaultJournal?: string;
  loading?: boolean;
  save: (params: any) => void;
  queryParams: IQueryParams;
};

type State = {
  firstTransaction?: ITransaction;
}

const TransactionForm = (props: Props) => {
  const {
    queryParams,
    transactions,
    defaultJournal,
    loading,

    save,
  } = props;

  const [state, setState] = useState<State>({
    firstTransaction: transactions?.find(tr => tr._id === tr.parentId) as ITransaction,
  });

  const [trDocs, setTrDocs] = useState<ITransaction[]>(transactions || defaultJournal && [journalConfigMaps[defaultJournal || '']?.defaultData()] || []);
  const [currentTransaction, setCurrentTransaction] = useState(transactions && (transactions.find(tr => tr._id === queryParams.trId) || transactions[0]));
  const [balance, setBalance] = useState((transactions || []).reduce((balance, tr) => {
    balance.dt += tr.sumDt
    balance.ct += tr.sumCt
    return balance;
  }, { dt: 0, ct: 0 }));

  const getBalance = () => {
    return (trDocs || []).reduce((balance, tr) => {
      balance.dt += tr.sumDt
      balance.ct += tr.sumCt
      return balance;
    }, { dt: 0, ct: 0 });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const onChange = (key: string, value: any) => {
    setState((prevState) => ({ ...prevState, [key]: value }));
  };

  const renderButtons = () => {
    const SmallLoader = ButtonMutate.SmallLoader;

    const cancelButton = (
      <Link to={`/pos`}>
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          btnStyle="success"
          icon={'check-circle'}
          onClick={handleSubmit}
        >
          Save
        </Button>
      </Button.Group>
    );
  };

  const onAddTr = (journal) => {
    const trData = journalConfigMaps[journal]?.defaultData()
    trDocs?.push(trData)
    console.log(trDocs)
    setTrDocs(trDocs)
    setCurrentTransaction(trData)
  }

  const onRemoveTr = (id) => {
    setTrDocs(trDocs.filter(tr => tr._id !== id))
    if (currentTransaction?._id === id) {
      setCurrentTransaction(trDocs[0])
    }
  }

  const renderTabContent = () => {
    if (!currentTransaction) {
      return (<Box>
        <EmptyContent>
          <EmptyState
            text={__(`Уучлаарай. Идэвхитэй баримт сонгогдоогүй байна. Зөв табаа сонгоно уу.`)}
            image={`/images/actions/30.svg`}
          />
        </EmptyContent>
      </Box>);
    }

    if (currentTransaction.permission === 'hidden') {
      return (<Box>
        <EmptyContent>
          <EmptyState
            text={__(`Уучлаарай. Таны эрх уг гүйлгээг удирдах эрх хүрсэнгүй`)}
            image={`/images/actions/automation2.svg`}
          />
        </EmptyContent>
      </Box>);
    }

    const Component = journalConfigMaps[currentTransaction?.journal]?.component;
    return (
      <Box>
        <Component transactions={[currentTransaction]} />
      </Box>
    );
  }

  const breadcrumb = [{ title: 'Transactions', link: `/accountings/ptrlist` }, { title: 'Form' }];

  return (
    <StepWrapper>
      <Wrapper.Header title={__('Transaction')} breadcrumb={breadcrumb} />
      <LeftContent>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Number')}</ControlLabel>
              <FormControl
                name="number"
                defaultValue={state.firstTransaction?.number}
                autoFocus={true}
                required={true}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>{__('Date')}</ControlLabel>
              <DateControl
                required={true}
                defaultValue={state.firstTransaction?.date || new Date()}
                onChange={date => setState((prevState) => ({
                  ...prevState, date
                }))}
                name={'date'}
                placeholder="Enter date"
                dateFormat='YYYY-MM-DD'
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <Tabs grayBorder={true}>
          {(trDocs || []).map(tr => (
            <TabTitle
              key={tr._id}
              className={currentTransaction?._id === tr._id ? 'active' : ''}
              onClick={() => setCurrentTransaction(tr)}
            >
              {__(tr.journal)}
              <Icon icon='trash-alt' onClick={onRemoveTr.bind(this, tr._id)}></Icon>
            </TabTitle>
          ))}
          <TabTitle>
            <PopoverButton>
              <Dropdown
                as={DropdownToggle}
                toggleComponent={
                  <>
                    <Icon icon='add' />
                    {__('New transaction')}
                    <Icon icon="angle-down" />
                  </>
                }
              >
                <FormWrapper>
                  <div >
                    <ul>
                      <strong>Ерөнхий</strong>
                      <li onClick={onAddTr.bind(this, 'main')}>
                        Ерөнхий журнал
                      </li>
                      <li>
                        Авлага өглөг
                      </li>
                      <li>
                        НӨАТ
                      </li>
                    </ul>
                    <ul>
                      <strong>Мөнгөн хөрөнгө</strong>
                      <li onClick={onAddTr.bind(this, 'cash')}>
                        Касс
                      </li>
                      <li>
                        Харилцах
                      </li>
                    </ul>
                    <ul>
                      <strong>Бараа материал</strong>
                      <li>
                        Орлого
                      </li>
                      <li>
                        Хангамжийн зарлага
                      </li>
                      <li>
                        Борлуулалт (байнгын)
                      </li>
                      <li>
                        Борлуулалт (ажил үйлчилгээ)
                      </li>
                      <li>
                        Дотоод хөдөлгөөн
                      </li>
                    </ul>
                    <ul>
                      <strong>Үндсэн хөрөнгө</strong>
                      <li>
                        Орлого
                      </li>
                      <li>
                        Акт
                      </li>
                      <li>
                        Хөдөлгөөн
                      </li>
                      <li>
                        Тохируулга
                      </li>
                    </ul>
                  </div>
                </FormWrapper>
              </Dropdown>
            </PopoverButton>

          </TabTitle>
        </Tabs>
        {renderTabContent()}

        <ControlWrapper>
          <Indicator>
            {__('You are')} {currentTransaction?._id ? 'editing' : 'creating'} {__('transaction')}.
            {__('Sum Debit')}: <strong>{balance.dt ?? 0}</strong> {__('Sum Credit')}: <strong>{balance.ct ?? 0}</strong>
            {__('Diff')}: <strong>{balance.dt ?? 0 - balance.ct ?? 0}</strong>
          </Indicator>
          {renderButtons()}
        </ControlWrapper>
      </LeftContent>
    </StepWrapper >
  );
};

export default TransactionForm;
