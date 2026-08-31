import { Routes, Route } from 'react-router-dom';
import { App } from './app';
import { Form } from './form';
import { LiveForm } from './form/live-form';
import { Poll } from './poll';

/**
 * Add new routes here.
 * Example:
 *   <Route path="/form/:formId" element={<FormWidget />} />
 *   <Route path="/booking" element={<BookingWidget />} />
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/form" element={<Form />} />
      <Route path="/poll" element={<Poll />} />
      <Route path="/live/:id/:formId" element={<LiveForm />} />
    </Routes>
  );
}
