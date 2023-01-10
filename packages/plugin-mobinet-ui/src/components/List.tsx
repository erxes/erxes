import { Title } from '@erxes/ui-settings/src/styles';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Table from '@erxes/ui/src/components/table';
import { BarItems } from '@erxes/ui/src/layout';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { router, __ } from '@erxes/ui/src/utils';

import React from 'react';
import { withRouter } from 'react-router-dom';
import { IMobinet, IType } from '../types';
import Form from './Form';
import OSMBuildings from '../common/OSMBuildings';
import Row from './Row';
import { submenu } from '../utils';

type Props = {
  viewType: string;
  mobinets: IMobinet[];
  types: IType[];
  typeId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (mobinet: IMobinet) => void;
  edit: (mobinet: IMobinet) => void;
  loading: boolean;
} & IRouterProps;

function List({
  mobinets,
  typeId,
  types,
  remove,
  renderButton,
  loading,
  edit,
  viewType,
  history
}: Props) {
  const [isMap, setIsMap] = React.useState(
    viewType && viewType.includes('map')
  );

  const onClickToggle = () => {
    router.setParams(history, { viewType: isMap ? 'list' : 'map' });

    !isMap && window.location.reload();

    setIsMap(!isMap);
  };

  const trigger = (
    <Button id={'AddMobinetButton'} btnStyle="success" icon="plus-circle">
      Add Mobinet
    </Button>
  );

  const modalContent = props => (
    <Form
      {...props}
      types={types}
      renderButton={renderButton}
      mobinets={mobinets}
    />
  );

  const actionBarRight = (
    <BarItems>
      <Button btnStyle="simple" size="small" onClick={onClickToggle}>
        <Icon icon={isMap ? 'list' : 'map'} />
      </Button>

      <ModalTrigger
        title={__('Add mobinet')}
        trigger={trigger}
        content={modalContent}
        enforceFocus={false}
      />
    </BarItems>
  );

  const title = <Title capitalize={true}>{__('Mobinet')}</Title>;

  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
  );

  const renderMap = () => {
    if (!isMap) {
      return null;
    }

    const onClickBuilding = e => {};

    const mapProps = {
      id: Math.random().toString(),
      onClickBuilding
    };

    return <OSMBuildings {...mapProps} />;
  };

  const renderList = () => {
    if (isMap) {
      return null;
    }
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Todo')}</th>
            <th>{__('Expiry Date')}</th>
            <th>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody id={'MobinetsShowing'}>
          {mobinets.map(mobinet => {
            return (
              <Row
                space={0}
                key={mobinet._id}
                mobinet={mobinet}
                remove={remove}
                edit={edit}
                renderButton={renderButton}
                mobinets={mobinets}
                types={types}
              />
            );
          })}
        </tbody>
      </Table>
    );
  };

  const content = (
    <>
      {renderList()}
      {renderMap()}
    </>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Mobinets" */ '../containers/SideBarList'
    )
  );

  const breadcrumb = [{ title: __('Mobinet'), link: '/mobinets' }];

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Mobinet')}
          submenu={submenu}
          // breadcrumb={breadcrumb}
        />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          count={1}
          emptyText={__('Theres no mobinet')}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={<SideBarList currentTypeId={typeId} />}
      transparent={true}
      hasBorder
    />
  );
}

export default withRouter<Props>(List);
