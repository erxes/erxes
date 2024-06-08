import { Actions, InfoWrapper, PopoverHeader, PopoverButton } from "@erxes/ui/src/styles/main";
import { Popover } from '@headlessui/react';
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import FormGroup from '@erxes/ui/src/components/form/Group';
import dayjs from 'dayjs';
import { LeftContent } from '@erxes/ui-settings/src/styles';
import {
  Alert,
  Button,
  ButtonMutate,
  Icon,
  Step,
  Steps,
  Wrapper,
  __,
} from '@erxes/ui/src';
import FormControl from '@erxes/ui/src/components/form/Control';
import {
  ControlWrapper,
  Indicator,
  StepWrapper,
} from '@erxes/ui/src/components/step/styles';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
} from "@erxes/ui/src/styles/main";
import { IQueryParams } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ITransaction } from '../types';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { format } from 'date-fns';
import { Box } from '@erxes/ui-contacts/src/customers/styles';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { journalComponentMaps } from '../utils/maps';
import { EmptyContent } from "@erxes/ui-log/src/activityLogs/styles";
import EmptyState from '@erxes/ui/src/components/EmptyState';
// import Popover from "@erxes/ui/src/components/Popover";

type Props = {
  transactions?: ITransaction[];
  defaultJournal?: string;
  loading?: boolean;
  save: (params: any) => void;
  queryParams: IQueryParams;
};

type State = {
  transactions?: ITransaction[];
  firstTransaction?: ITransaction;
  balance: { dt: number; ct: number; }
}

const TransactionForm = (props: Props) => {
  const {
    queryParams,
    transactions,
    defaultJournal,
    loading,
    save,
  } = props;

  const getBalance = () => {
    return { dt: 0, ct: 0 }
  }


  const [state, setState] = useState<State>({
    firstTransaction: transactions?.find(tr => tr._id === tr.parentId) as ITransaction,
    balance: getBalance(),
    transactions: transactions || [journalComponentMaps[defaultJournal || '']?.defaultData || {}]
  });

  const [currentTransaction, setCurrentTransaction] = useState(transactions?.find(tr => tr._id === queryParams.trId));

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

    const Component = journalComponentMaps[currentTransaction?.journal]?.component;
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
          {(state.transactions || []).map(tr => (
            <TabTitle
              key={tr._id}
              className={currentTransaction?._id === tr._id ? 'active' : ''}
              onClick={() => setCurrentTransaction(tr)}
            >
              {__(tr.journal)} {tr._id}
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
                      <li>
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
                      <li>
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
            {__('Sum Debit')}: <strong>{state.balance.dt ?? 0}</strong> {__('Sum Credit')}: <strong>{state.balance.ct ?? 0}</strong>
            {__('Diff')}: <strong>{state.balance.dt ?? 0 - state.balance.ct ?? 0}</strong>
          </Indicator>
          {renderButtons()}
        </ControlWrapper>
      </LeftContent>
    </StepWrapper >
  );
};

export default TransactionForm;
