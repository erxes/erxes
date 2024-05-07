import React, { useEffect, useState } from 'react';
import { __, router } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IUser } from '@erxes/ui/src/auth/types';

import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import ListContainer from '../containers/switchboard/List';
import { menuCall } from '../constants';

type IProps = {
  queryParams: any;
  navigate: any;
  location: any;
  //   meetingQuery?: MeetingsQueryResponse;
};

function List(props: IProps) {
  const { queryParams,  navigate } = props;
//   const { meetingId } = queryParams;

  const [component, setComponent] = useState(<div/>);
  const [leftSideBar, setLeftSideBar] = useState(<div />);

  // const routePath = location?.pathname?.split('/').slice(-1)[0].toString();
  //console.log('location.pathname.routePath****', routePath, 'queryParams');
  let routePath = 's'
  useEffect(() => {
    switch (routePath) {
      case 'statistics':
          console.log(
              'statistics'
          )
          setComponent(<div>statistics</div>);
        break;
      default:
        <ListContainer navigate={navigate} location={location}/>;
        break;
    }
  }, [routePath]);

  return ( 
    <Wrapper
      header={
        <Wrapper.Header title={__('Call Dashboard')} submenu={menuCall()} />
      }
      content={
        <DataWithLoader
          data={<ListContainer navigate={navigate} location={location} />}
          loading={false}
          count={1}
          emptyText={__('Theres no calls')}
          emptyImage="/images/actions/8.svg"
        />
      }
      //   leftSidebar={leftSideBar}
      //   transparent={true}
      hasBorder
    />
  );
}

export default List;
