import Spinner from '@erxes/ui/src/components/Spinner';
import React, { useRef, useEffect, useState } from 'react';
import OpenStreetMap from '../common/OpenStreetMapBuildings';
import { useExternalScript } from '../customHooks/useExternalScript';

type Props = {};

const Map = (props: any) => {
  //   const mapScriptStatus = useExternalScript('');
  const [mapScriptStatus, setMapScriptStatus] = useState('loading');

  let script: HTMLScriptElement | Element | null = document.querySelector(
    `script[src="./js/osmb.js"]`
  );

  useEffect(() => {
    if (!script) {
      const externalScript = document.createElement(
        'script'
      ) as HTMLScriptElement;
      externalScript.type = 'application/javascript';
      externalScript.src = './js/osmb.js';
      externalScript.async = true;
      document.body.appendChild(externalScript);
      script = externalScript;

      externalScript.addEventListener('load', () => {
        setMapScriptStatus('ready');
      });
    }
  }, []);

  const onClickBuilding = (e) => {
    console.log(e);
  };

  const updatedProps = {
    ...props,
    onClickBuilding,
  };

    console.log('mapScriptStatus: ', mapScriptStatus);

  return (
    <>
      {mapScriptStatus === 'loading' && <Spinner />}
      {mapScriptStatus === 'ready' && <OpenStreetMap {...updatedProps} />}
      {mapScriptStatus === 'error' && (
        <div>
          {'Map did not load properly,  please try refreshing the page'}
        </div>
      )}
    </>
  );
};

export default Map;
