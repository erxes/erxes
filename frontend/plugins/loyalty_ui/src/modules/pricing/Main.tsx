import { Route, Routes } from 'react-router-dom';
import { IndexPage } from '~/pages/pricing/IndexPage';
import { DetailPage } from '~/pages/pricing/DetailPage';

const Main = () => {
  return (
    <Routes>
      <Route index element={<IndexPage />} />
      <Route path=":id" element={<DetailPage />} />
    </Routes>
  );
};

export default Main;
