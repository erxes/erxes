import React from 'react';
import { MenuItem } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';


function Dashboard() {
  const header = (
    <Wrapper.Header title="Dashboard" description="Control everything">
      <MenuItem href="#">Action</MenuItem>
    </Wrapper.Header>
  );

  return (
    <div>
      <Wrapper
        header={header}
        content={<div></div>}
      />
    </div>
  );
}

export default Dashboard;
