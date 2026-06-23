import React, { useState } from 'react';
import { Button } from 'erxes-ui';
import { ITdbConfig } from '../types';

type Props = {
  config?: ITdbConfig;
  onSubmit: (doc: any) => void;
  closeModal: () => void;
};

const Form = ({ config, onSubmit, closeModal }: Props) => {
  const [name, setName] = useState(config?.name || '');
  const [description, setDescription] = useState(config?.description || '');
  const [apiUrl, setApiUrl] = useState(config?.apiUrl || 'https://acsmc.tdbmlabs.mn:8000/order');
  const [username, setUsername] = useState(config?.username || '');
  const [password, setPassword] = useState('');
  const [testMode, setTestMode] = useState(config?.testMode ?? true);

  const isEdit = !!config;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = { name, description, apiUrl, username, password, testMode };
    onSubmit(doc);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">API URL</label>
        <input
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required={!isEdit}
        />
        {isEdit && <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Mode</label>
        <select
          value={testMode ? 'true' : 'false'}
          onChange={(e) => setTestMode(e.target.value === 'true')}
          className="w-full border rounded p-2"
        >
          <option value="true">Test</option>
          <option value="false">Production</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={closeModal}>Cancel</Button>
        <Button type="submit">{isEdit ? 'Save' : 'Add'}</Button>
      </div>
    </form>
  );
};

export default Form;