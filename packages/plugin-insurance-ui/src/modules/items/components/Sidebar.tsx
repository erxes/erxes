import React, { useState, useEffect } from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import CityFilter from '../containers/filters/CityFilter';

const Sidebar = ({ loadingMainQuery }) => {
  const [abortController, setAbortController] = useState(new AbortController());

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, [abortController]);

  return (
    <Wrapper.Sidebar hasBorder>
      <CityFilter loadingMainQuery={loadingMainQuery} abortController={abortController} />
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
