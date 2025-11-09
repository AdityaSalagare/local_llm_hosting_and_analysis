import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Menu, X, MoreVertical, Download, Share2, Moon, Sun } from 'lucide-react'
import { conversationService } from '../services/apiService'
import { useWebSocket } from '../hooks/useWebSocket'
import { useDarkMode } from '../hooks/useDarkMode'
import VoiceInput from '../components/VoiceInput'
import MessageReactions from '../components/MessageReactions'
import ExportModal from '../components/ExportModal'
import ShareModal from '../components/ShareModal'
import ThinkingBlock from '../components/ThinkingBlock'
import Sidebar from '../components/Sidebar'

export default function Chat() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [sidebarRefresh, setSidebarRefresh] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const { isConnected, sendMessage, currentMessage, streamingTokens } = useWebSocket(
    conversationId,
    (message) => {
      setMessages(prev => [...prev, message])
    }
  )

  useEffect(() => {
    if (conversationId) {
      // Store current conversation ID
      localStorage.setItem('lastConversationId', conversationId)
      loadConversation()
    } else {
      // Check for existing active conversation first
      findOrCreateConversation()
    }
  }, [conversationId])

  const findOrCreateConversation = async () => {
    try {
      setIsLoading(true)
      
      // First, try to restore the last conversation you were on
      const lastConvId = localStorage.getItem('lastConversationId')
      if (lastConvId) {
        try {
          const lastConv = await conversationService.getById(lastConvId)
          if (lastConv.data) {
            navigate(`/chat/${lastConvId}`, { replace: true })
            return
          }
        } catch (error) {
          // Conversation doesn't exist, continue to find active
          localStorage.removeItem('lastConversationId')
        }
      }
      
      // Try to find an active conversation
      const response = await conversationService.getAll({ status: 'active' })
      const activeConvs = response.data.results || response.data || []
      
      if (activeConvs.length > 0) {
        // Use the most recent active conversation
        const latestActive = activeConvs[0]
        navigate(`/chat/${latestActive.id}`, { replace: true })
      } else {
        // No active conversation, create a new one
        createNewConversation()
      }
    } catch (error) {
      console.error('Error finding conversation:', error)
      // Fallback to creating new conversation
      createNewConversation()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingTokens])

  const loadConversation = async () => {
    try {
      const response = await conversationService.getById(conversationId)
      setConversation(response.data)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const createNewConversation = async () => {
    try {
      const response = await conversationService.create({ title: 'New Conversation' })
      navigate(`/chat/${response.data.id}`, { replace: true })
      setSidebarRefresh(prev => prev + 1) // Refresh sidebar
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    sendMessage(inputMessage)
  }

  const handleEndConversation = async () => {
    if (!conversationId) return
    try {
      await conversationService.end(conversationId)
      await loadConversation()
      setShowMenu(false)
      setSidebarRefresh(prev => prev + 1) // Refresh sidebar
    } catch (error) {
      console.error('Error ending conversation:', error)
      // If already ended, just refresh
      if (error.response?.status === 400) {
        await loadConversation()
        setSidebarRefresh(prev => prev + 1)
      }
    }
  }

  const handleExport = async (format) => {
    try {
      const response = await conversationService.export(conversationId, format)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `conversation_${conversationId}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setShowExportModal(false)
      setShowMenu(false)
    } catch (error) {
      console.error('Error exporting conversation:', error)
    }
  }

  const handleShare = async () => {
    try {
      const response = await conversationService.share(conversationId)
      setShowShareModal(true)
      setShowMenu(false)
    } catch (error) {
      console.error('Error sharing conversation:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        refreshTrigger={sidebarRefresh}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {conversation?.title || 'New Conversation'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {conversation && (
              <>
                {/* End Conversation Button - Visible when active */}
                {conversation.status === 'active' && (
                  <button
                    onClick={handleEndConversation}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg transition-colors"
                    title="End this conversation and generate a summary"
                  >
                    End Conversation
                  </button>
                )}
                {/* Status Badge - Show when ended */}
                {conversation.status === 'ended' && (
                  <span className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                    Ended
                  </span>
                )}
                {/* More Options Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          setShowExportModal(true)
                          setShowMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={handleShare}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-b-lg"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 && !isLoading && !streamingTokens && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Start a conversation by typing a message below
                </p>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">AI</span>
                    </div>
                  )}
                  <div className={`flex-1 ${message.sender === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.thinking && message.thinking.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.thinking.map((thinking, idx) => (
                            <ThinkingBlock key={idx} thinking={thinking} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      {message.sender === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center ml-auto">
                          <span className="text-sm font-semibold text-white">U</span>
                        </div>
                      )}
                      <MessageReactions messageId={message.id} reactions={message.reactions} />
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">U</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming message */}
              {currentMessage && streamingTokens && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">AI</span>
                  </div>
                  <div className="flex-1 max-w-[85%]">
                    <div className="rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {streamingTokens}
                        <span className="animate-pulse">▊</span>
                      </p>
                      {currentMessage.thinking && currentMessage.thinking.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {currentMessage.thinking.map((thinking, idx) => (
                            <ThinkingBlock key={idx} thinking={thinking} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative">
              <div className="flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message AI..."
                  className="flex-1 resize-none border-0 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm max-h-32 overflow-y-auto"
                  rows={1}
                  disabled={!isConnected || !conversationId}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                />
                <div className="flex items-center gap-1">
                  <VoiceInput
                    onTranscript={(text) => setInputMessage(text)}
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isConnected || !conversationId}
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2 px-4">Connecting to server...</p>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}
      {showShareModal && conversation && (
        <ShareModal
          conversation={conversation}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
