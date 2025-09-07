'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showText?: boolean;
  variant?: 'default' | 'comic' | 'minimal';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Creating your comic...',
  showText = true,
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <motion.div
          className={`${sizeClasses[size]} border-2 border-purple-600/30 border-t-purple-600 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (variant === 'comic') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <motion.div
            className={`${sizeClasses[size]} border-4 border-transparent rounded-full`}
            style={{
              background: 'conic-gradient(from 0deg, #8B5CF6, #EC4899, #06B6D4, #8B5CF6)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <div className={`absolute inset-1 bg-black rounded-full flex items-center justify-center`}>
            <motion.div
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎨
            </motion.div>
          </div>
        </div>
        {showText && (
          <motion.p
            className={`${textSizeClasses[size]} text-white font-medium text-center`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={`${sizeClasses[size]} border-4 border-purple-600/20 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner spinning element */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-purple-600 border-r-pink-500 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>

      {showText && (
        <motion.div
          className="flex flex-col items-start"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className={`${textSizeClasses[size]} text-white font-medium`}>{text}</span>
          <motion.div
            className="flex space-x-1 mt-1"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LoadingSpinner;
