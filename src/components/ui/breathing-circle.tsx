import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BreathingCircleProps {
  isBreathing: boolean;
  progress: number;
  color: string;
}

const breathingVariants = {
  inhale: {
    scale: 1.2,
    opacity: 0.8,
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  },
  exhale: {
    scale: 1,
    opacity: 0.3,
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  }
};

export function BreathingCircle({ isBreathing, progress, color }: BreathingCircleProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className={cn(
          "w-40 h-40 rounded-full",
          color,
          "opacity-30"
        )}
        variants={breathingVariants}
        animate={isBreathing ? "inhale" : "exhale"}
      />
    </div>
  );
}
