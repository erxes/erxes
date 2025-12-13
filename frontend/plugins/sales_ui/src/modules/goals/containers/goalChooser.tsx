import React, { useState } from "react";
import GoalFormContainer from "./goalForm";
import type { IGoalType } from "../types";

type Props = {
  data: {
    _id?: string;
    name: string;
    goalTypes: IGoalType[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (items: IGoalType[]) => void;
  closeModal: () => void;
};


const GoalTypeChooser = ({ data, onSelect, closeModal }: Props) => {
  const [selected, setSelected] = useState<IGoalType | null>(null);
  const [showForm, setShowForm] = useState(false);

  const onAdd = () => {
    setSelected(null);
    setShowForm(true);
  };

  const onEdit = (item: IGoalType) => {
    setSelected(item);
    setShowForm(true);
  };

  const onSave = (saved: IGoalType) => {
    const updated = [...data.goalTypes];

    if (!selected) {
      
      updated.push(saved);
    } else {
      
      const idx = updated.findIndex((g) => g._id === selected._id);
      if (idx !== -1) updated[idx] = saved;
    }

    onSelect(updated);
    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Select Goal Type</h2>
        <button className="text-gray-500 hover:text-black" onClick={closeModal}>
          ✕
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-2">
        {data.goalTypes.length === 0 && (
          <p className="text-sm text-gray-500">No goal types yet.</p>
        )}

        {data.goalTypes.map((item) => (
          <div
            key={item._id}
            className="p-2 border rounded flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{item.entity}</div>
              <div className="text-xs text-gray-400">
                {item.contributionType}
              </div>
            </div>

            <button
              onClick={() => onEdit(item)}
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
          onClick={onAdd}
        >
          + Add Goal Type
        </button>

        <button
          className="px-3 py-1 rounded bg-green-600 text-white text-sm"
          onClick={closeModal}
        >
          Done
        </button>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-4 w-full max-w-lg">
            <GoalFormContainer
              goalType={selected || undefined}
              closeModal={() => setShowForm(false)}
              getAssociatedGoalType={onSave}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTypeChooser;
