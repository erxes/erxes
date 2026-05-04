import { useState } from 'react';

const InsuranceSettings = () => {
  const [apiEndpoint, setApiEndpoint] = useState(
    localStorage.getItem('insurance_api_endpoint') || '',
  );

  const handleSave = () => {
    localStorage.setItem('insurance_api_endpoint', apiEndpoint);
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">Даатгалын тохиргоо</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Endpoint
          </label>
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            placeholder="http://localhost:4000/graphql"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Даатгалын API серверийн хаяг
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Хадгалах
        </button>
      </div>
    </div>
  );
};

export default InsuranceSettings;
