import { useState } from 'react'
import { Send, Brain } from 'lucide-react'
import { conversationService } from '../services/apiService'
import { format } from 'date-fns'

export default function Intelligence() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleQuery = async () => {
    if (!query.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await conversationService.query({ query })
      setResult(response.data)
    } catch (error) {
      console.error('Error querying conversations:', error)
      setResult({
        answer: 'Sorry, I encountered an error processing your query.',
        excerpts: [],
        related_conversations: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuery()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white mb-2">Conversation Intelligence</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ask questions about your past conversations and get intelligent answers with relevant excerpts.
        </p>
      </div>

      {/* Query Input */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your past conversations... (e.g., 'What did I discuss about travel last week?')"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={!query.trim() || loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Query
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Answer */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold dark:text-white">Answer</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {result.answer}
            </p>
          </div>

          {/* Excerpts */}
          {result.excerpts && result.excerpts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold dark:text-white mb-4">Relevant Excerpts</h2>
              <div className="space-y-4">
                {result.excerpts.map((excerpt, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-r"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {excerpt.conversation_title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(excerpt.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{excerpt.sender.toUpperCase()}:</span>{' '}
                      {excerpt.message}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Similarity: {(excerpt.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Conversations */}
          {result.related_conversations && result.related_conversations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold dark:text-white mb-4">Related Conversations</h2>
              <div className="space-y-2">
                {result.related_conversations.map((conv, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold dark:text-white">{conv.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(conv.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(conv.similarity * 100).toFixed(1)}% match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Enter a query above to search through your conversation history
          </p>
        </div>
      )}
    </div>
  )
}

