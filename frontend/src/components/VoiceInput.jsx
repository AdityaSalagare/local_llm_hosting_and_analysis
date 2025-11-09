import { useState, useRef, useEffect } from 'react'
import { Mic, Square } from 'lucide-react'

export default function VoiceInput({ onTranscript, isRecording, setIsRecording }) {
  const recognitionRef = useRef(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        onTranscript(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording
          recognitionRef.current.start()
        }
      }
    }
  }, [])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  return (
    <button
      onClick={toggleRecording}
      className={`p-2 rounded-lg transition-colors ${
        isRecording
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  )
}

