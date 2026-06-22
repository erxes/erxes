import React from 'react';
import { useForecast } from '../hooks/useForecast';
import { Card } from 'erxes-ui';

interface Props {
  filters: { fromDate?: string; toDate?: string; dateRange?: string };
}

export const ForecastWidget: React.FC<Props> = ({ filters }) => {
  const { forecast, loading, error } = useForecast(filters);

  if (loading) return <div className="text-center py-8">Loading forecast...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!forecast) return null;

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-lg font-semibold">Forecast Revenue</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="text-3xl font-bold">{forecast.totalForecast.toLocaleString()}</div>

        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-2">By Stage</h4>
          <div className="space-y-1">
            {forecast.byStage.map((item: any) => (
              <div key={item.stageId} className="flex justify-between text-sm">
                <span>{item.stageName}</span>
                <span className="font-medium">{item.forecast.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-600 mb-2">By Probability</h4>
          <div className="space-y-1">
            {forecast.byProbability.map((item: any) => (
              <div key={item.bucket} className="flex justify-between text-sm">
                <span>{item.bucket}</span>
                <span className="font-medium">{item.forecast.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};