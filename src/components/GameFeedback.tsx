import { motion, AnimatePresence } from 'framer-motion'

interface GameFeedbackProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
}

export function GameFeedback({ message, type, isVisible }: GameFeedbackProps) {
  const colors = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${colors[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 