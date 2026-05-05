import { Button, Input } from 'erxes-ui';
import { useState } from 'react';
import { GaConfig } from '../types';

interface AnalyticsSetupProps {
  initialConfig: GaConfig | null;
  onSave: (config: GaConfig) => void;
}

export function AnalyticsSetup({ initialConfig, onSave }: AnalyticsSetupProps) {
  const [propertyId, setPropertyId] = useState(initialConfig?.propertyId || '');
  const [clientId, setClientId] = useState(initialConfig?.clientId || '');

  const handleSave = () => {
    if (!propertyId.trim() || !clientId.trim()) return;
    onSave({ propertyId: propertyId.trim(), clientId: clientId.trim() });
  };

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 border rounded-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Connect Google Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your GA4 Property ID and OAuth Client ID to connect your analytics data.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">GA4 Property ID</label>
          <Input
            placeholder="e.g. 123456789"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Found in Google Analytics → Admin → Property Settings
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">OAuth Client ID</label>
          <Input
            placeholder="e.g. 123456789-xxx.apps.googleusercontent.com"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Found in Google Cloud Console → APIs & Services → Credentials
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={!propertyId.trim() || !clientId.trim()}>
        Save & Connect
      </Button>

      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p className="font-medium">Setup checklist:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enable the <strong>Google Analytics Data API</strong> in Google Cloud Console</li>
          <li>Create an OAuth 2.0 Client ID (Web application type)</li>
          <li>Add your domain to <strong>Authorized JavaScript origins</strong></li>
          <li>Grant your Google account access to the GA4 property</li>
        </ol>
      </div>
    </div>
  );
}
