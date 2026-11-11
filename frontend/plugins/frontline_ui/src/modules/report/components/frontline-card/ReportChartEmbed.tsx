import { createContext, ReactNode, useContext } from 'react';

// A chart drawn inside another frame (a home dashboard tile) that owns the
// title, filters and actions; the card then draws only its content.
const ReportChartEmbedContext = createContext(false);

export const ReportChartEmbedProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => (
  <ReportChartEmbedContext.Provider value>
    {children}
  </ReportChartEmbedContext.Provider>
);

export const useReportChartEmbedded = () => useContext(ReportChartEmbedContext);
