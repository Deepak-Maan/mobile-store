import React, { useEffect, useState, useRef, useCallback } from 'react';

export const DecryptedText = ({ text = '', speed = 50, delay = 0, hoverTrigger = false }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '!@#$%^&*()_+{}[]|;:<>?/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const intervalRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const startDecrypt = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    let iterations = 0;
    const targetText = text;
    
    intervalRef.current = setInterval(() => {
      const resolved = targetText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iterations) {
            return targetText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      setDisplayText(resolved);

      if (iterations >= targetText.length) {
        clearInterval(intervalRef.current);
        isAnimatingRef.current = false;
      }
      
      iterations += 1/3; // Controls speed of character resolution
    }, speed);
  }, [text, speed]);

  useEffect(() => {
    let delayTimer;
    if (!hoverTrigger) {
      delayTimer = setTimeout(() => {
        startDecrypt();
      }, delay);
    } else {
      // Set initial display to cipher strings
      const cipherInitial = text
        .split('')
        .map(c => (c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]))
        .join('');
      setDisplayText(cipherInitial);
    }

    return () => {
      clearTimeout(delayTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, delay, hoverTrigger, startDecrypt]);

  const handleMouseEnter = () => {
    if (hoverTrigger) {
      startDecrypt();
    }
  };

  return (
    <span 
      onMouseEnter={handleMouseEnter} 
      style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums' }}
    >
      {displayText || text}
    </span>
  );
};
