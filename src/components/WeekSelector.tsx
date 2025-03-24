import { useState } from "react";

type Week = {
  week_id: number;
  week: string;
};

type WeekSelectorProps = {
  weeks: Week[];
};

const WeekSelector: React.FC<WeekSelectorProps> = ({ weeks }) => {
  const [selectedWeekId, setSelectedWeekId] = useState<number>(weeks[0]?.week_id);

  return (
    <div className="flex space-x-7">
      {weeks?.map(({ week_id, week }) => (
        <button
          key={week_id}
          onClick={() => setSelectedWeekId(week_id)}
          className={`px-4 py-2 border rounded transition-colors 
            ${selectedWeekId === week_id ? "bg-[#3AAD73] text-white" : "border-[#3AAD73] text-gray-700"}`}
        >
         <p className="text-black text-xs font-medium font-neris">  {week} </p>
    
        </button>
      ))}
    </div>
  );
};

export default WeekSelector;
