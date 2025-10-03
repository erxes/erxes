import { BrandsHeader } from './BrandsHeader';
import { BrandsRecordTable } from './BrandsRecordTable';
import { BrandsSubHeader } from './BrandsSubHeader';

export function BrandsView() {
  return (
    <>
      <BrandsHeader />
      <BrandsSubHeader />
      <BrandsRecordTable />
    </>
  );
}
