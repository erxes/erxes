import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import {
  FieldStyle,
  SectionBodyItem,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

export type Props = {
  customerAccount?: any;
};

export default function Component(props: Props) {
  const { customerAccount } = props;

  console.log(customerAccount);

  //   const renderActionSection = customer => {
  //     if (!actionSection) {
  //       return;
  //     }

  //     const ActionSection = actionSection;
  //     return <ActionSection customer={customer} isSmall={true} />;
  //   };

  const renderBody = () => {
    if (!customerAccount) {
      return <EmptyState icon="piggybank" text="No data" />;
    }

    return (
      <SectionBodyItem>
        <SidebarList>
          <li>
            <FieldStyle>
              {__('Balance')} : {customerAccount.balance.toLocaleString()} ₮
            </FieldStyle>
          </li>
        </SidebarList>
      </SectionBodyItem>
    );
  };

  // const managePlaces = (props) => (
  //   <DealPlaceForm
  //     dealId={dealId}
  //     dealPlace={dealPlace}
  //     closeModal={props.closeModal}
  //   />
  // );

  // const extraButtons = (
  //   <>
  //     <ModalTrigger
  //       title="Places"
  //       size="lg"
  //       trigger={
  //         <button>
  //           <Icon icon={dealPlace ? 'edit-3' : 'plus-circle'} />
  //         </button>
  //       }
  //       content={managePlaces}
  //     />
  //   </>
  // );

  return (
    <Box
      title={__('Account')}
      // extraButtons={extraButtons}
      isOpen={true}
      name="account"
    >
      {renderBody()}
    </Box>
  );
}
