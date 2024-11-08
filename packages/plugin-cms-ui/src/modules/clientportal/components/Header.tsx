import React from 'react';
import { useNavigate } from 'react-router-dom';
import SelectCp from '../containers/SelectCp';

type Props = {
  currentConfig: any;
};

const MainContainer = (props: Props) => {
  const [currentConfig, setCurrentConfig] = React.useState<any>(
    props.currentConfig
  );
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentConfig?._id) {
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set('cpid', currentConfig._id);
      navigate(`?${queryParams.toString()}`, { replace: true });
    }
  }, [currentConfig, navigate]);

  const title = currentConfig?.name || 'Website';
  const description = currentConfig.url || currentConfig.domain || '';
  console.log('title', title, ' desc ', description);

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
