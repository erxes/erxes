import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

// import { ROAD_CONDITIONS } from '../../constants';
// import DirectionForm from '../../containers/directions/Form';
// import { IDirection } from '../../types';

type Props = {
  direction?: any;
  remove?: (directionId: string) => void;
};

const Row = (props: Props) => {
  const { direction } = props;

  const { roadConditions } = direction;
  //   let conditionString = '';

  //   for (const c of roadConditions) {
  //     conditionString += ROAD_CONDITIONS[c] + ', ';
  //   }

  //   conditionString = conditionString.slice(0, -2);

  //   const renderRemoveAction = () => {
  //     const { direction, remove } = props;

  //     const onClick = () => remove(direction._id);

  //     return (
  //       <Tip text={__('Delete')} placement="top">
  //         <Button
  //           id="directionDelete"
  //           btnStyle="link"
  //           onClick={onClick}
  //           icon="times-circle"
  //         />
  //       </Tip>
  //     );
  //   };

  const formContent = props => (
    // <DirectionForm {...props} direction={direction} />
    <>content</>
  );

  //   companyName: 'test',
  //   industry: 'test',
  //   phone: 'test',
  //   email: 'test'

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{direction.companyName || '-'}</RowTitle>
      </td>
      <td key={Math.random()}>
        <RowTitle>{direction.industry || '-'}</RowTitle>
      </td>
      <td key={Math.random()}>
        <RowTitle>{direction.phone || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{direction.email || '-'}</RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit direction'}
            trigger={<Button btnStyle="link" icon="edit-3" />}
            content={formContent}
            size={'lg'}
          />
          {/* {renderRemoveAction()} */}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
