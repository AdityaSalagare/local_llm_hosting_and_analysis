import { useState } from 'react'
import { ChevronDown, ChevronUp, Brain } from 'lucide-react'

export default function ThinkingBlock({ thinking }) {
  const [isExpanded, setIsExpanded] = useState(true) // Default to expanded

  if (!thinking || !thinking.trim()) {
    return null
  }

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 w-full transition-colors mb-2"
      >
        <Brain className="w-4 h-4 text-purple-500 dark:text-purple-400" />
        <span>AI Thinking Process</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 ml-auto" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 ml-auto" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {thinking}
        </div>
      )}
    </div>
  )
}

