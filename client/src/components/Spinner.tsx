import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Spinner({ className }: Readonly<{ className?: string }>) {
  return <Loader2 className={clsx('animate-spin', className)} />;
}

export function PageLoader({ label = 'Loading' }: Readonly<{ label?: string }>) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink/50">
      <Spinner className="h-7 w-7 text-forest-500" />
      <p className="text-sm">{label}...</p>
    </div>
  );
}
