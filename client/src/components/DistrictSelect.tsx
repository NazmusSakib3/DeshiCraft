import clsx from 'clsx';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshDistricts';

type DistrictSelectProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
}>;

export function DistrictSelect({
  value,
  onChange,
  required = false,
  className,
  id,
}: DistrictSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={clsx('input', className)}
    >
      <option value="" disabled>
        Select district
      </option>
      {BANGLADESH_DISTRICTS.map((district) => (
        <option key={district} value={district}>
          {district}
        </option>
      ))}
    </select>
  );
}
