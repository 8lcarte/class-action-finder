import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface LawsuitCardProps {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  compensation?: string;
  eligibilityCount?: number;
  onClick?: () => void;
}

export default function LawsuitCard({
  id,
  title,
  description,
  deadline,
  compensation,
  eligibilityCount,
  onClick
}: LawsuitCardProps) {
  return (
    <Card
      className="h-full transition-shadow hover:shadow-md"
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {deadline && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Deadline: {deadline}</span>
              </div>
            )}
          </div>
          <Button size="sm" onClick={onClick}>
            View Details
          </Button>
        </div>
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">{description}</p>
      
      <div className="mt-4 flex flex-wrap gap-4">
        {compensation && (
          <div className="flex items-center text-sm">
            <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">Est. Compensation: {compensation}</span>
          </div>
        )}
        
        {eligibilityCount !== undefined && (
          <div className="flex items-center text-sm">
            <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">{eligibilityCount.toLocaleString()} people eligible</span>
          </div>
        )}
      </div>
    </Card>
  );
}
