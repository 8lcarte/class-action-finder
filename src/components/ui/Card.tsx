import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function Card({ 
  title, 
  description, 
  footer, 
  children, 
  className = '' 
}: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 ${className}`}>
      <div className="p-6">
        {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
        {description && <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
      {footer && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          {footer}
        </div>
      )}
    </div>
  );
}
