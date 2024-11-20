'use client'
import { motion } from 'framer-motion';

export function SkeletonBoard() {
  return (
    <div className="w-full flex justify-center items-center min-h-[50vh]">
      <div className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-4">
        <div 
          className="grid mx-auto w-full gap-6"
          style={{ 
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          }}
        >
          {Array(16).fill(null).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="aspect-square relative p-1 rounded-xl border-2 
                        bg-gray-700/20 border-gray-600/20"
            />
          ))}
        </div>
      </div>
    </div>
  );
} 