import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.hash = '#/dashboard'
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-slate-50 text-slate-800">
          <div className="max-w-lg w-full bg-white border border-rose-200 rounded-xl p-8 shadow-lg space-y-5 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Module View Recovered</h2>
              <p className="text-xs text-slate-500 mt-1">
                An unexpected view error occurred while rendering this tab. Your underlying client data is safe.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 text-rose-300 p-3 rounded font-mono text-[11px] text-left max-h-36 overflow-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-md shadow-xs cursor-pointer transition-colors"
              >
                <RefreshCw size={13} />
                <span>Reload This Module</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/'
                }}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-md border border-slate-200 cursor-pointer transition-colors"
              >
                <Home size={13} />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
