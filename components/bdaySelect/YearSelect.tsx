import { ChangeEvent } from "react";

type SelectProps = {
  title: string;
  years: string[];
  handleChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};


export const YearSelect = ({ title, years, handleChange }: SelectProps) => {
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
    >
      <option defaultValue="" selected disabled>
        {title}
      </option>
      {years.map((year, index) => {
        return (
          <option key={index} value={year}>
            {year}
          </option>
        );
      })}
    </select>
  );
};
