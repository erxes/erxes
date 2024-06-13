import { AppConsumer } from 'coreui/appContext';
import {
  __,
  Icon,
} from '@erxes/ui/src';
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import {
  FormWrapper, PopoverButton
} from "@erxes/ui/src/styles/main";
import React, { useState } from 'react';
import { can } from '@erxes/ui/src/utils';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  onClick: (journal: string) => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props

const AddTransactionLink = (props: FinalProps) => {
  const { onClick, currentUser } = props;
  return (
    <PopoverButton>
      <Dropdown
        as={DropdownToggle}
        toggleComponent={
          <>
            <Icon icon='add' />&nbsp;
            {__('New transaction')}
            <Icon icon="angle-down" />
          </>
        }
      >
        <FormWrapper>
          <div >
            <ul>
              <strong>Ерөнхий</strong>
              {
                can('accountingsCreateMainTr', currentUser) &&
                <li onClick={onClick.bind(this, 'main')}>
                  Ерөнхий журнал
                </li>
              }

              <li onClick={onClick.bind(this, 'debt')}>
                Авлага өглөг
              </li>
              <li>
                НӨАТ
              </li>
            </ul>
            <ul>
              <strong>Мөнгөн хөрөнгө</strong>
              <li onClick={onClick.bind(this, 'cash')}>
                Касс
              </li>
              <li onClick={onClick.bind(this, 'fund')}>
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
  )

}

export default (props: Props) => (
  <AppConsumer>
    {({ currentUser }) => (
      <AddTransactionLink {...props} currentUser={currentUser || ({} as IUser)} />
    )}
  </AppConsumer>
);
