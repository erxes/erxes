import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { Link } from 'react-router-dom';
import {
  Box,
  BoxName,
} from '@erxes/ui-settings/src/main/styles';
import { IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import { AccountingsSubMenus } from "../../constants";
import HeaderDescription from "@erxes/ui/src/components/HeaderDescription";

type Props = {
  queryParams: IQueryParams;
};

const titles = [
  { to: '', image: 'erxes-07.svg', title: __('Fund rate equation') },
  { to: '', image: 'erxes-07.svg', title: __('Debt rate equation') },
  { to: '/accountings/adjusting/invCostAdj', image: 'erxes-07.svg', title: __('Inventories cost adjusting') },
  { to: '', image: 'erxes-07.svg', title: __('Fixed assets deprecation') },
  { to: '', image: 'erxes-07.svg', title: __('Main closing') },
];

const Adjustings = (props: Props) => {

  const renderContent = () => {
    return (
      titles.map(t => (
        <Box>
          <Link to={t.to || '#'}>
            <img src={`/images/icons/${t.image || 'erxes-07.svg'}`} />
            <BoxName>{__(t.title)}</BoxName>
          </Link>
        </Box>
      ))
    );
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Perfect Transactions")}
          queryParams={props.queryParams}
          submenu={AccountingsSubMenus}
        />
      }
      mainHead={
        <HeaderDescription
          icon="/images/actions/30.svg"
          title={"Transactions"}
          description={`${__(
            "All information and know-how related to your business transactions and services are found here"
          )}.${__(
            "Create and add in unlimited transactions and servicess so that you and your team members can edit and share"
          )}`}
        />
      }
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
};

export default Adjustings;
