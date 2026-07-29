import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

export interface DashboardTab {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export function DashboardNav({ title, tabs }: { title: string; tabs: DashboardTab[] }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <nav className="mt-4 flex flex-wrap gap-1 border-b border-ink/8">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'border-forest-500 text-forest-500'
                  : 'border-transparent text-ink/50 hover:text-ink',
              )
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink/50">{label}</span>
        <Icon className="h-5 w-5 text-forest-400" />
      </div>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}
