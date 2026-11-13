import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = PackageOpen, title = 'No data found', description = 'There are no items to display.', action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-background-secondary rounded-full mb-4">
        <Icon size={48} className="text-text-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      {action && (
        <button onClick={action} className="btn-primary">{actionLabel || 'Get Started'}</button>
      )}
    </div>
  );
}
