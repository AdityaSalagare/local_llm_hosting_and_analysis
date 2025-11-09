import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Download, Share2, Calendar } from 'lucide-react'
import { conversationService } from '../services/apiService'
import { format } from 'date-fns'
import ExportModal from '../components/ExportModal'
import ShareModal from '../components/ShareModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [searchQuery, statusFilter])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter) params.status = statusFilter
      
      const response = await conversationService.getAll(params)
      setConversations(response.data.results || response.data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    navigate('/chat')
  }

  const handleConversationClick = (id) => {
    navigate(`/chat/${id}`)
  }

  const handleExport = async (format) => {
    if (!selectedConversation) return
    try {
      const response = await conversationService.export(selectedConversation.id, format)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `conversation_${selectedConversation.id}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setShowExportModal(false)
    } catch (error) {
      console.error('Error exporting conversation:', error)
    }
  }

  const handleShare = (conversation) => {
    setSelectedConversation(conversation)
    setShowShareModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Conversations</h1>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          New Conversation
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleConversationClick(conversation.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold dark:text-white mb-1">
                    {conversation.title || `Conversation ${conversation.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {conversation.preview || conversation.summary || 'No preview available'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(conversation.start_time), 'MMM d, yyyy HH:mm')}
                    </span>
                    <span>{conversation.message_count || 0} messages</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        conversation.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {conversation.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedConversation(conversation)
                      setShowExportModal(true)
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Export"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(conversation)
                    }}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showExportModal && selectedConversation && (
        <ExportModal
          onClose={() => {
            setShowExportModal(false)
            setSelectedConversation(null)
          }}
          onExport={handleExport}
        />
      )}
      {showShareModal && selectedConversation && (
        <ShareModal
          conversation={selectedConversation}
          onClose={() => {
            setShowShareModal(false)
            setSelectedConversation(null)
          }}
        />
      )}
    </div>
  )
}

