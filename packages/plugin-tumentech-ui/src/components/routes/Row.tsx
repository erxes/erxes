import { RowTitle } from '@erxes/ui-engage/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import RouteForm from '../../containers/routes/Form';
import { IRoute } from '../../types';

type Props = {
  route: IRoute;
  remove: (routeid: string) => void;
};

const Row = (props: Props) => {
  const { route } = props;

  const renderRemoveAction = () => {
    const { route, remove } = props;

    const onClick = () => remove(route._id);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button
          id="routeDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  };

  const formContent = props => <RouteForm {...props} route={route} />;

  const duration = route.summary.totalDuration || 0;

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{route.name || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{route.code || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{route.summary.placeNames || '-'}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{`${Math.floor(duration / 60)}H:${duration % 60}m`}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{route.summary.totalDistance || '0'}</RowTitle>
      </td>

      <td>
        <ActionButtons>
          <ModalTrigger
            title={'Edit route'}
            trigger={<Button btnStyle="link" icon="edit-3" />}
            content={formContent}
            size={'lg'}
          />
          {renderRemoveAction()}
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
