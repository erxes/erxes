import React, { useState, useRef } from 'react';

const PermissionGroupForm: React.FC<{
  permissionGroup?: any;
  onSubmit?: (any) => any;
}> = ({ permissionGroup, onSubmit }) => {
  const [name, setName] = useState(permissionGroup?.name || '');

  const preSubmit = e => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        name
      });
    }
  };

  return (
    <div>
      <form onSubmit={preSubmit}>
        <input
          value={name}
          placeholder="Name of the group"
          type="text"
          name="name"
          onChange={e => setName(e.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PermissionGroupForm;
