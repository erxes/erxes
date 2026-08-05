import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Ticket = lazy(() =>
  import('~/pages/TicketIndexPage').then((module) => ({
    default: module.TicketsIndexPage,
  })),
);

const TicketMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Ticket />} />
      </Routes>
    </Suspense>
  );
};

export default TicketMain;
