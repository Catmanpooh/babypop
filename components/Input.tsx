import { ChangeEvent, useId, SyntheticEvent } from "react";

type InputProps = {
  title: string;
  type: string;
  placeholder: string;
  value: string;
  submitName: string;
  showButton: boolean;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: SyntheticEvent) => void;
};

export const Input = ({
  title,
  type,
  placeholder,
  value,
  submitName,
  showButton,
  handleChange,
  handleSubmit,
}: InputProps) => {
  const id = useId();

  return (
    <div className="flex flex-col">
      <label className="text-xl" htmlFor={id + title}>
        {title}
      </label>
      <div className="flex flex-row h-12 mt-4">
        <input
          className="grow rounded-l-lg pl-4 outline-none"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
        />
        {showButton? (
          <button
            className="flex w-32 justify-center items-center bg-slate-400 rounded-r-lg"
            type="submit"
            onClick={handleSubmit}
          >
            {submitName}
          </button>
        ) : null}
      </div>
    </div>
  );
};
