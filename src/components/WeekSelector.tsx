import { useState } from "react";

type WeekSelectorProps = {
  weeks: string[];
};

const WeekSelector: React.FC<WeekSelectorProps> = ({ weeks }) => {
  const [selectedWeek, setSelectedWeek] = useState<string>(weeks[0]);

  return (
    <div className="flex space-x-2">
      {weeks.map((week) => (
        <button
          key={week}
          onClick={() => setSelectedWeek(week)}
          className={`px-4 py-2 border rounded transition-colors 
            ${selectedWeek === week ? "bg-[#3AAD73] text-white" : "border-[#3AAD73] text-gray-700"}`}
        >
          Week of {week}
        </button>
      ))}
    </div>
  );
};

export default WeekSelector;
