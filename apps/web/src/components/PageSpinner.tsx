import { Spinner } from 'erxes-ui';

/** A page still loading: a spinner in the middle of the space it will fill. */
export const PageSpinner = () => (
  <div className="flex h-full items-center justify-center">
    <Spinner />
  </div>
);
