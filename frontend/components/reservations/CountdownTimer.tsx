'use client';

import React, { useEffect } from 'react';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt?: string;
  createdAt: string;
  durationMinutes?: number;
}

export function CountdownTimer({ expiresAt, createdAt, durationMinutes = 5 }: CountdownTimerProps) {
  const { formatted, timeLeft, isExpired, minutes, seconds } = useCountdown({
    expiresAt,
    createdAt,
    durationMinutes,
  });

  // Debug: Log the props to see what we're receiving
  useEffect(() => {
    console.log('CountdownTimer Props:', {
      expiresAt,
      createdAt,
      durationMinutes,
      timeLeft,
      isExpired,
      currentTime: new Date().toISOString(),
    });
  }, [expiresAt, createdAt, durationMinutes, timeLeft, isExpired]);

  const isUrgent = timeLeft < 60 && timeLeft > 0; // Less than 1 minute but not expired

  // Always show the countdown, even if expired (backend will update status)
  return (
    <div className={`flex items-center gap-3 ${isUrgent ? 'text-red-600' : isExpired ? 'text-gray-500' : 'text-blue-600'}`}>
      <Clock className={`w-6 h-6 ${isUrgent ? 'animate-pulse' : ''}`} />
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide opacity-80">Time Remaining</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-xl font-bold">:</span>
          <span className="text-3xl font-bold tabular-nums">{seconds.toString().padStart(2, '0')}</span>
        </div>
        <span className="text-xs opacity-70 mt-0.5">
          {isExpired ? 'Expired - Updating status...' : `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  );
}
