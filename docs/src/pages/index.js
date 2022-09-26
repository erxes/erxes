import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

function Home() {
  return (window.location.href = useBaseUrl('/docs/intro'));
}

export default Home;
