import React, { useState } from 'react';
// import { ComponentType } from './App';

type PropertiesEditorProps = {
  component: any;
  onUpdate: (id: string, updatedProperties: Partial<any>) => void;
};

const PropertiesEditor = ({ component, onUpdate }: PropertiesEditorProps) => {
    
    if (!component) {
        return <p>No component selected</p>;
    }
  const [content, setContent] = useState(component.content);

  const handleUpdate = () => {
    onUpdate(component.id, { content });
  };

  return (
    <div>
      <h4>Edit Properties</h4>
      <div>
        <label>
          Content:
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <button onClick={handleUpdate} style={{ marginTop: '8px' }}>
          Update
        </button>
      </div>
    </div>
  );
};

export default PropertiesEditor;
