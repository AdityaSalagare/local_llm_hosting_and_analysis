import { useEffect, useRef, useState } from 'react'
import websocketService from '../services/websocketService'

export function useWebSocket(conversationId, onMessage) {
  const [isConnected, setIsConnected] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(null)
  const [streamingTokens, setStreamingTokens] = useState('')
  const [currentThinking, setCurrentThinking] = useState([])
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!conversationId) return

    const handleMessage = (data) => {
      if (data.type === 'open') {
        setIsConnected(true)
      } else if (data.type === 'user_message') {
        setIsConnected(true)
      } else if (data.type === 'close' || data.type === 'error') {
        setIsConnected(false)
      } else if (data.type === 'ai_message_start') {
        setCurrentMessage({ id: data.message_id, content: '', sender: 'ai', thinking: [] })
        setStreamingTokens('')
        setCurrentThinking([])
      } else if (data.type === 'ai_message_token') {
        setStreamingTokens(prev => prev + data.token)
      } else if (data.type === 'ai_thinking') {
        // Add thinking to current message
        setCurrentThinking(prev => {
          const newThinking = [...prev, data.thinking]
          setCurrentMessage(prevMsg => prevMsg ? { ...prevMsg, thinking: newThinking } : null)
          return newThinking
        })
      } else if (data.type === 'ai_message_complete') {
        setCurrentMessage(prev => {
          const finalMessage = { ...data.message, thinking: prev?.thinking || [] }
          setStreamingTokens('')
          setCurrentThinking([])
          if (onMessageRef.current) {
            onMessageRef.current(finalMessage)
          }
          return finalMessage
        })
      } else if (data.type === 'user_message') {
        if (onMessageRef.current) {
          onMessageRef.current(data.message)
        }
      }
    }

    const handleError = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    websocketService.connect(conversationId, handleMessage, handleError)

    return () => {
      websocketService.disconnect()
    }
  }, [conversationId])

  const sendMessage = (message) => {
    websocketService.sendMessage(message)
  }

  return {
    isConnected,
    sendMessage,
    currentMessage,
    streamingTokens,
    currentThinking,
  }
}

