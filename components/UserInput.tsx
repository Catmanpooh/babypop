import { ChangeEvent } from "react";

type InputProps = {
  title: string;
  type: string;
  placeholder: string;
  value: string | undefined;
  styles: string | undefined;
  isRequired: boolean;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const UserInput = ({
  title,
  type,
  value,
  placeholder,
  styles,
  isRequired,
  handleChange,
}: InputProps) => {
  const rounded = styles?.includes("rounded-l-lg") ? "rounded-l-lg" : "rounded";

  return (
    <input
      className={`${styles}
        form-select 
      form-select-lg 
      mb-3
      appearance-none
      block
      px-4
      py-2
      text-xl
      font-normal
      text-gray-700
      bg-white bg-clip-padding bg-no-repeat
      border border-solid border-gray-300
      ${rounded}
      transition
      ease-in-out
      m-0
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
      type={type}
      value={value}
      placeholder={placeholder}
      required={isRequired}
      onChange={handleChange}
    />
  );
};
