import { __ } from '@erxes/ui/src/utils/index';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import RTG from 'react-transition-group';
import { RightDrawerContainer } from '../../styles';
import { Button } from '@erxes/ui/src';

type Props = {
  component: any;

  queryParams: any;
  history: any;
};

const List = (props: Props) => {
  const { queryParams, history, component } = props;
  const Component = component;
  let Form;

  const [showDrawer, setShowDrawer] = useState(false);
  const wrapperRef = useRef<any>(null);

  const handleDrawer = (value: boolean) => {
    setShowDrawer(value);
  };

  return (
    <>
      <Wrapper
        hasBorder={true}
        header={
          <Wrapper.Header
            title={__('Insight')}
            submenu={[{ title: __('Insight'), link: '/insight' }]}
          />
        }
        content={<Component queryParams={queryParams} history={history} />}
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
      />

      <div ref={wrapperRef}>
        <RTG.CSSTransition
          in={showDrawer}
          timeout={300}
          classNames="slide-in-right"
          unmountOnExit={true}
        >
          <RightDrawerContainer>{<>Form here</>}</RightDrawerContainer>
        </RTG.CSSTransition>
      </div>
    </>
  );
};

export default List;
