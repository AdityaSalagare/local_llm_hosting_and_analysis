import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, Trash2, MoreVertical, Download, Share2, Brain, BarChart3 } from 'lucide-react'
import { conversationService } from '../services/apiService'
import { format } from 'date-fns'

export default function Sidebar({ isOpen, onClose, refreshTrigger }) {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const [conversations, setConversations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [searchQuery, refreshTrigger])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const params = {} // Show all conversations
      if (searchQuery) params.search = searchQuery
      
      const response = await conversationService.getAll(params)
      const allConvs = response.data.results || response.data || []
      // Sort: active first, then by date
      const sorted = allConvs.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1
        return new Date(b.start_time) - new Date(a.start_time)
      })
      setConversations(sorted)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      // Create a new conversation explicitly
      const response = await conversationService.create({ title: 'New Conversation' })
      navigate(`/chat/${response.data.id}`)
      if (window.innerWidth < 768) {
        onClose()
      }
    } catch (error) {
      console.error('Error creating new conversation:', error)
    }
  }

  const handleConversationClick = (id) => {
    navigate(`/chat/${id}`)
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  const getConversationTitle = (conv) => {
    if (conv.title && conv.title !== 'New Conversation') {
      return conv.title
    }
    // Get first message as title
    if (conv.preview) {
      return conv.preview.substring(0, 50) + (conv.preview.length > 50 ? '...' : '')
    }
    return 'New Conversation'
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-900 border-r border-gray-800 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-3 border-b border-gray-800 space-y-1">
          <button
            onClick={() => navigate('/intelligence')}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
          >
            <Brain className="w-4 h-4" />
            <span>Intelligence</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : (
            <div className="p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleConversationClick(conv.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors group ${
                    conversationId === conv.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {getConversationTitle(conv)}
                        </p>
                        {conv.status === 'active' && (
                          <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(conv.start_time), 'MMM d')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

