import React from 'react';

type Props = {
  formTypes: any[];
};

const Forms = (props: Props) => {
    console.log('Forms', props.formTypes);
  return <div>Forms</div>;
};

export default Forms;
