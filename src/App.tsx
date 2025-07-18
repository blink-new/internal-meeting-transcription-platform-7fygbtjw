import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/pages/Dashboard'
import { MeetingRecorder } from './components/pages/MeetingRecorder'
import { Meetings } from './components/pages/Meetings'
import { Toaster } from './components/ui/toaster'

type Page = 'dashboard' | 'meetings' | 'recorder' | 'transcripts' | 'analytics' | 'team' | 'settings'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Meeting Transcription Platform</h1>
            <p className="text-muted-foreground">
              Record, transcribe, and analyze your meetings with AI-powered insights.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Sign In to Continue
            </button>
            
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">Supported sign-in methods:</p>
              <div className="flex items-center justify-center space-x-4">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.5 12.2c0-1.4-.1-2.7-.3-4H12.2v7.5h6.4c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-8.8 0-.6-.1-1.2-.2-1.5z"/>
                    <path d="M12.2 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3.1c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.7v3.1C3.8 21.9 7.7 24 12.2 24z"/>
                    <path d="M5.6 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.7H1.7C.6 8.9 0 10.4 0 12s.6 3.1 1.7 5.3l3.9-3.1z"/>
                    <path d="M12.2 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C18.1 1.2 15.4 0 12.2 0 7.7 0 3.8 2.1 1.7 5.3l3.9 3.1c.9-2.8 3.5-4.6 6.6-4.6z"/>
                  </svg>
                  <span>Microsoft</span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Secure authentication powered by Blink
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'meetings':
        return <Meetings />
      case 'recorder':
        return <MeetingRecorder />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} user={user} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  )
}

export default App