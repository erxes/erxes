import React from "react";
import dayjs from "dayjs";
import { IGoalType } from "../types";

type Props = {
  goalType: IGoalType;
  boardName?: string;
  pipelineName?: string;
  stageName?: string;
  onEdit: (goalType: IGoalType) => void;
};

const GoalView = ({
  goalType,
  boardName,
  pipelineName,
  stageName,
  onEdit,
}: Props) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-3 py-2 text-center">
        <input type="checkbox" className="w-4 h-4 cursor-pointer" />
      </td>

      <td className="px-3 py-2">{goalType.name}</td>
      <td className="px-3 py-2">{goalType.entity || '-'}</td>
      <td className="px-3 py-2">{boardName || '-'}</td>
      <td className="px-3 py-2">{pipelineName || '-'}</td>
      <td className="px-3 py-2">{stageName || '-'}</td>
      <td className="px-3 py-2">{goalType.contributionType || '-'}</td>
      <td className="px-3 py-2">{goalType.metric || '-'}</td>

      <td className="px-3 py-2">
        {goalType.startDate
          ? dayjs(goalType.startDate).format('MM/DD/YYYY')
          : '-'}
      </td>

      <td className="px-3 py-2">
        {goalType.endDate ? dayjs(goalType.endDate).format('MM/DD/YYYY') : '-'}
      </td>

      <td className="px-3 py-2 text-center">
        <button
          type="button"
          onClick={() => onEdit?.(goalType)}
          className="text-gray-600 hover:text-black cursor-pointer"
        >
          ✏️
        </button>
      </td>
    </tr>
  );
};

export default GoalView;
