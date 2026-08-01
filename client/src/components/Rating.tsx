import { Star } from 'lucide-react';
import clsx from 'clsx';

type RatingProps = Readonly<{
  value: number;
  count?: number;
  size?: number;
  className?: string;
}>;

export function Rating({ value, count, size = 14, className }: RatingProps) {
  return (
    <div className={clsx('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: size, height: size }}
            className={clsx(
              star <= Math.round(value) ? 'fill-brass-400 text-brass-400' : 'text-ink/20',
            )}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-ink/50">({count})</span>}
    </div>
  );
}
