import { Routes, Route } from 'react-router-dom';
import { App } from './app';
import { Form } from './form';

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
    </Routes>
  );
}
