import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, change, changeLabel, icon: Icon, iconBg = 'bg-primary-50', iconColor = 'text-primary', prefix = '' }) {
  const isPositive = change > 0;
  const isNeutral = change === 0 || change === undefined || change === null;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-secondary truncate">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{prefix}{value}</p>
          {!isNeutral && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-danger" />
              )}
              <span className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-text-tertiary ml-1">{changeLabel}</span>
              )}
            </div>
          )}
          {isNeutral && changeLabel && (
            <div className="flex items-center gap-1 mt-2">
              <Minus size={14} className="text-text-tertiary" />
              <span className="text-xs text-text-tertiary">{changeLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon size={24} className={iconColor} />
          </div>
        )}
      </div>
    </div>
  );
}
