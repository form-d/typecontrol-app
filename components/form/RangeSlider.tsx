import React from 'react';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

const RangeSlider = ({ label, min, max, step, value, onChange, unit }: RangeSliderProps): React.ReactElement => {
  return (
    <label className="block">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full"
      />
      <span className="ml-2">{value.toFixed(2)}{unit}</span>
    </label>
  );
};

export default RangeSlider;
