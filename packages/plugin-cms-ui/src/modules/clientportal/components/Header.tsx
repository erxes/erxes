import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SelectCp from '../containers/SelectCp';

type Props = {
  currentConfig: any;
};

const MainContainer = (props: Props) => {
  const [currentConfig, setCurrentConfig] = React.useState<any>(
    props.currentConfig
  );
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (currentConfig?._id) {
      navigate(`${location.pathname}?web=${currentConfig._id}`, { replace: true });
    }
  }, [currentConfig, navigate]);

  const title = currentConfig?.name || 'Website';
  const description = currentConfig.url || currentConfig.domain || '';

  return (
    <div style={{ minWidth: 200 }}>
      <SelectCp
        label={'a'}
        name='selectedCp'
        multi={false}
        initialValue={currentConfig._id}
        onSelect={(e) => {
          const value = e as string;
          setCurrentConfig(value);
          localStorage.setItem('clientPortalId', value);
        }}
      />
    </div>
  );
};

export default MainContainer;
