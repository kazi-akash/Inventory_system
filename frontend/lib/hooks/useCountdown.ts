import { useState, useEffect } from 'react';

interface UseCountdownOptions {
  expiresAt?: string | null;
  createdAt?: string | null;
  durationMinutes?: number;
}

export function useCountdown(
  expiresAtOrOptions: string | null | UseCountdownOptions,
  createdAt?: string | null,
  durationMinutes: number = 5
) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Handle both old and new API
  let expiresAt: string | null = null;
  let calculatedCreatedAt: string | null = null;
  let duration = durationMinutes;

  if (typeof expiresAtOrOptions === 'string' || expiresAtOrOptions === null) {
    // Old API: useCountdown(expiresAt)
    expiresAt = expiresAtOrOptions;
    calculatedCreatedAt = createdAt || null;
  } else {
    // New API: useCountdown({ expiresAt, createdAt, durationMinutes })
    expiresAt = expiresAtOrOptions.expiresAt || null;
    calculatedCreatedAt = expiresAtOrOptions.createdAt || null;
    duration = expiresAtOrOptions.durationMinutes || 5;
  }

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      let expiry: number;

      // Priority 1: Use expiresAt if available (backend provides this)
      if (expiresAt) {
        // Handle timestamps without 'Z' suffix by adding it for proper UTC parsing
        const expiresAtISO = expiresAt.endsWith('Z') ? expiresAt : expiresAt + 'Z';
        expiry = new Date(expiresAtISO).getTime();
      } 
      // Priority 2: Calculate from createdAt + duration
      else if (calculatedCreatedAt) {
        const createdAtISO = calculatedCreatedAt.endsWith('Z') ? calculatedCreatedAt : calculatedCreatedAt + 'Z';
        const created = new Date(createdAtISO).getTime();
        expiry = created + (duration * 60 * 1000);
      } else {
        return 0;
      }

      const difference = expiry - now;
      const secondsLeft = Math.max(0, Math.floor(difference / 1000));
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Countdown calculation:', {
          expiresAt,
          calculatedCreatedAt,
          now: new Date(now).toISOString(),
          expiry: new Date(expiry).toISOString(),
          differenceMs: difference,
          secondsLeft,
        });
      }
      
      return secondsLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calculatedCreatedAt, duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return {
    timeLeft,
    minutes,
    seconds,
    isExpired: timeLeft <= 0,
    formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
}
