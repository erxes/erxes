import {
  __,
  Icon,
} from '@erxes/ui/src';
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import {
  FormWrapper, PopoverButton, PopoverHeader
} from "@erxes/ui/src/styles/main";
import React, { useState } from 'react';

type Props = {
  onClick: (journal: string) => void;
};

const AddTransactionLink = (props: Props) => {
  const { onClick } = props;

  return (
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
              <li onClick={onClick.bind(this, 'main')}>
                Ерөнхий журнал
              </li>
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
export default AddTransactionLink