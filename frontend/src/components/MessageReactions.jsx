import { useState } from 'react'
import { Smile } from 'lucide-react'
import { messageService } from '../services/apiService'

const EMOJIS = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '💯', '🤔']

export default function MessageReactions({ messageId, reactions = {} }) {
  const [showPicker, setShowPicker] = useState(false)
  const [currentReactions, setCurrentReactions] = useState(reactions)

  const handleReact = async (emoji) => {
    try {
      const response = await messageService.react(messageId, emoji)
      setCurrentReactions(response.data.reactions)
      setShowPicker(false)
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="text-xs opacity-70 hover:opacity-100"
        title="Add reaction"
      >
        <Smile className="w-4 h-4" />
      </button>

      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {Object.keys(currentReactions).length > 0 && (
        <div className="flex gap-1 mt-1">
          {Object.entries(currentReactions).map(([emoji, count]) => (
            <span key={emoji} className="text-xs">
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

