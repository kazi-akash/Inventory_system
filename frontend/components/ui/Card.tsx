import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-6 border-b border-gray-200', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-6 border-t border-gray-200', className)} {...props}>
      {children}
    </div>
  );
}
