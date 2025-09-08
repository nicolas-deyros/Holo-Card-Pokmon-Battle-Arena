import React from 'react';

interface SubsectionTitleProps {
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const SubsectionTitle: React.FC<SubsectionTitleProps> = ({
  children,
  description,
  className,
}) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <h3 className="text-xl font-bold text-white mb-2">{children}</h3>
      {description && <p className="text-slate-400 text-sm">{description}</p>}
    </div>
  );
};
