import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { conversationService } from '../services/apiService'
import { format, subDays } from 'date-fns'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [useDateFilter, setUseDateFilter] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 365), 'yyyy-MM-dd'), // Default to 1 year
    to: format(new Date(), 'yyyy-MM-dd')
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange, useDateFilter])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const params = {}
      if (useDateFilter) {
        params.date_from = dateRange.from
        params.date_to = dateRange.to
      }
      const response = await conversationService.getAnalytics(params)
      console.log('Analytics data:', response.data) // Debug log
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error loading analytics:', error)
      console.error('Error details:', error.response?.data)
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  const prepareDateData = () => {
    if (!analytics?.date_stats) return []
    return Object.entries(analytics.date_stats).map(([date, stats]) => ({
      date: format(new Date(date), 'MMM d'),
      conversations: stats.count,
      messages: stats.messages
    }))
  }

  const prepareSentimentData = () => {
    if (!analytics?.sentiment_distribution) return []
    return Object.entries(analytics.sentiment_distribution).map(([sentiment, count]) => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      value: count
    }))
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
      </div>
    )
  }

  if (!analytics || (analytics.total_conversations === 0 && analytics.total_messages === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Start having conversations to see analytics
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Insights and trends from your conversations
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useDateFilter}
              onChange={(e) => setUseDateFilter(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium dark:text-gray-300">Filter by date range</span>
          </label>
        </div>
        {useDateFilter && (
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Conversations
          </h3>
          <p className="text-3xl font-bold dark:text-white">{analytics.total_conversations || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Messages
          </h3>
          <p className="text-3xl font-bold dark:text-white">{analytics.total_messages || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Avg Messages/Conversation
          </h3>
          <p className="text-3xl font-bold dark:text-white">
            {analytics.average_messages_per_conversation?.toFixed(1) || '0.0'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Over Time */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4">
            Conversations Over Time
          </h2>
          {prepareDateData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareDateData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversations" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              No data for selected date range
            </div>
          )}
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4">
            Sentiment Distribution
          </h2>
          {prepareSentimentData().length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareSentimentData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepareSentimentData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              No sentiment data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

