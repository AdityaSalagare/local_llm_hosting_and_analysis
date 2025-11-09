import { useState } from 'react'
import { ChevronDown, ChevronUp, Brain } from 'lucide-react'

export default function ThinkingBlock({ thinking }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!thinking || !thinking.trim()) {
    return null
  }

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 w-full transition-colors"
      >
        <Brain className="w-3.5 h-3.5" />
        <span className="font-medium">Thinking</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {thinking}
        </div>
      )}
    </div>
  )
}

