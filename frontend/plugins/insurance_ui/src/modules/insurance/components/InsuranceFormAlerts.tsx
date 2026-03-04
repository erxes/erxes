interface InsuranceFormAlertsProps {
  error: string | null;
  success: boolean;
  successMessage?: string;
}

export const InsuranceFormAlerts = ({
  error,
  success,
  successMessage = 'Contract created successfully! Redirecting to contracts list...',
}: InsuranceFormAlertsProps) => {
  return (
    <>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          {successMessage}
        </div>
      )}
    </>
  );
};
