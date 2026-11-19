import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="bg-primary/10 text-primary grid size-14 place-items-center rounded-2xl">
        {icon}
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed opacity-70">{description}</p>
      {action}
    </div>
  );
}
