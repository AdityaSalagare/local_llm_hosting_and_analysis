import { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default function ConversationThread({ message, replies = [], onReply }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="ml-8 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
      <div className="flex items-start gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
            <p className="text-sm dark:text-white">{message.content}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {format(new Date(message.timestamp), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          {replies.length > 0 && isExpanded && (
            <div className="space-y-2">
              {replies.map((reply) => (
                <ConversationThread
                  key={reply.id}
                  message={reply}
                  replies={reply.replies || []}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => onReply(message.id)}
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mt-1"
          >
            <MessageSquare className="w-3 h-3" />
            Reply
          </button>
        </div>
      </div>
    </div>
  )
}

