/**
 * WebSocket service for real-time chat
 */
class WebSocketService {
  constructor() {
    this.ws = null
    this.conversationId = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.listeners = new Map()
  }

  connect(conversationId, onMessage, onError) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.conversationId === conversationId) {
      return // Already connected to this conversation
    }

    this.conversationId = conversationId
    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/`
    
    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        if (onMessage) {
          this.on('open', onMessage)
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (onMessage) {
            onMessage(data)
          }
          this.emit('message', data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        if (onError) {
          onError(error)
        }
        this.emit('error', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.emit('close')
        this.attemptReconnect(conversationId, onMessage, onError)
      }
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      if (onError) {
        onError(error)
      }
    }
  }

  attemptReconnect(conversationId, onMessage, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect(conversationId, onMessage, onError)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  sendMessage(message) {
    this.send({
      type: 'message',
      message: message,
    })
  }

  sendTyping(isTyping) {
    this.send({
      type: 'typing',
      is_typing: isTyping,
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.conversationId = null
      this.listeners.clear()
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

export default new WebSocketService()

