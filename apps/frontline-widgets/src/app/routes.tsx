import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Each route is its own chunk: the messenger iframe never downloads form
// code and the form iframe never downloads messenger code.
const App = lazy(() => import('./app').then((m) => ({ default: m.App })));
const Form = lazy(() => import('./form').then((m) => ({ default: m.Form })));
const LiveForm = lazy(() =>
  import('./form/live-form').then((m) => ({ default: m.LiveForm })),
);

/**
 * Add new routes here.
 * Example:
 *   <Route path="/form/:formId" element={<FormWidget />} />
 *   <Route path="/booking" element={<BookingWidget />} />
 */
export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/form" element={<Form />} />
        <Route path="/live/:id/:formId" element={<LiveForm />} />
      </Routes>
    </Suspense>
  );
}
