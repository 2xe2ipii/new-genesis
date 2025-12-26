// src/hooks/useTimer.ts
import { useState, useEffect } from 'react';

export const useTimer = (endTime: number) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);
      
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return { 
    minutes, 
    seconds: seconds < 10 ? `0${seconds}` : seconds, 
    isExpired: timeLeft === 0 && endTime > 0 
  };
};