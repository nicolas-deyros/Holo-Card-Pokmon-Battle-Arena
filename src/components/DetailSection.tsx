import React from 'react';

interface DetailSectionProps {
  title: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  className,
  innerClassName,
  children,
}) => {
  return (
    <div className={`bg-slate-900/50 rounded-xl p-6 shadow-lg ${className || ''}`}>
      <h2 className="text-2xl font-bold text-yellow-300 mb-6">{title}</h2>
      <div className={innerClassName}>{children}</div>
    </div>
  );
};
