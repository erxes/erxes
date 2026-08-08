import React from 'react';
import { useForecast } from '../hooks/useForecast';
import { SectionCard } from '../components/common/SectionCard';

interface Props {
  filters: { fromDate?: string; toDate?: string; dateRange?: string };
}

export const ForecastWidget: React.FC<Props> = ({ filters }) => {
  const { forecast, loading, error } = useForecast(filters);

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!forecast && !loading) {
    return null;
  }

  return (
    <SectionCard
      title="Forecast Revenue"
      loading={loading}
      skeletonHeight="h-64"
    >
      {forecast && (
        <div className="space-y-4">
          <div className="text-3xl font-bold">
            {forecast.totalForecast.toLocaleString()}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-600">
              By Stage
            </h4>

            <div className="space-y-1">
              {forecast.byStage.map((item: any) => (
                <div
                  key={item.stageId}
                  className="flex justify-between text-sm"
                >
                  <span>{item.stageName}</span>
                  <span className="font-medium">
                    {item.forecast.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-600">
              By Probability
            </h4>

            <div className="space-y-1">
              {forecast.byProbability.map((item: any) => (
                <div
                  key={item.bucket}
                  className="flex justify-between text-sm"
                >
                  <span>{item.bucket}</span>
                  <span className="font-medium">
                    {item.forecast.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};