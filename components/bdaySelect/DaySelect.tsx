import { ChangeEvent } from "react";

type SelectProps = {
  title: string;
  styles: string | undefined;
  days: string[];
  handleChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};


export const DaySelect = ({ title, days, handleChange }: SelectProps) => {
  return (
    <select
      className="form-select form-select-lg mb-3
appearance-none
block
w-2/6
px-4
py-2
text-xl
font-normal
text-gray-700
bg-white bg-clip-padding bg-no-repeat
border border-solid border-gray-300
rounded
transition
ease-in-out
m-0
focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
      onChange={handleChange}
      required
    >
      <option defaultValue="" selected disabled>
        {title}
      </option>
      {days.map((day, index) => {
        return (
          <option key={index} value={day}>
            {day}
          </option>
        );
      })}
    </select>
  );
};
