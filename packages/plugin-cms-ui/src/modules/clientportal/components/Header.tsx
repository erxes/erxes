import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SelectCp from '../containers/SelectCp';

type Props = {
  currentConfig: any;
};

const MainContainer = (props: Props) => {
  
  const [currentConfigId, setCurrentConfigId] = React.useState<string>(
    props.currentConfig._id
  );
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    
    if (currentConfigId) {
      navigate(`${location.pathname}?web=${currentConfigId}`, {
        replace: true,
      });
    }
  }, [currentConfigId, navigate]);

  return (
    <div style={{ minWidth: 200 }}>
      <SelectCp
        label={'Client Portal'}
        name='selectedCp'
        multi={false}
        initialValue={currentConfigId}
        onSelect={(e) => {
          const value = e as string;
          
          setCurrentConfigId(value);
          localStorage.setItem('clientPortalId', value);
        }}
      />
    </div>
  );
};

export default MainContainer;
