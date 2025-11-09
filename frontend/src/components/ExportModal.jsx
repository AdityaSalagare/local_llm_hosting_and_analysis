import { X } from 'lucide-react'

export default function ExportModal({ onClose, onExport }) {
  const formats = ['json', 'markdown', 'pdf']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Export Conversation</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Choose a format to export your conversation:
        </p>
        <div className="space-y-2">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => onExport(format)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 capitalize"
            >
              Export as {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

