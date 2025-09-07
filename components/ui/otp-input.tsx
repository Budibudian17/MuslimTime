'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Update internal state when value prop changes
    const newOtp = value.split('').slice(0, length);
    const paddedOtp = [...newOtp, ...new Array(length - newOtp.length).fill('')];
    setOtp(paddedOtp);
  }, [value, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Update parent component
    const otpValue = newOtp.join('');
    onChange(otpValue);

    // Focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn('flex space-x-2 justify-center', className)}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-12 text-center text-2xl font-mono font-bold',
            'bg-white/10 border-white/30 text-white placeholder:text-white/50',
            'focus:border-white/50 focus:ring-white/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
        />
      ))}
    </div>
  );
};
