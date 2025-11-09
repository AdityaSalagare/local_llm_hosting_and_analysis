import { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { conversationService } from '../services/apiService'

export default function ShareModal({ conversation, onClose }) {
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (conversation?.share_token) {
      setShareUrl(`${window.location.origin}/chat/shared/${conversation.share_token}`)
    } else {
      loadShareUrl()
    }
  }, [conversation])

  const loadShareUrl = async () => {
    try {
      const response = await conversationService.share(conversation.id)
      setShareUrl(response.data.share_url)
    } catch (error) {
      console.error('Error loading share URL:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Share Conversation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Share this conversation with others using the link below:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

