import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Calendar, Clock, Users, FileText, Mic, Play } from 'lucide-react'
import { blink } from '../../blink/client'

interface Meeting {
  id: string
  title: string
  duration: number
  participants: number
  createdAt: string
  status: 'completed' | 'processing' | 'failed'
  hasVideo: boolean
}

export function Dashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalHours: 0,
    thisWeek: 0,
    participants: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      const meetingsData = await blink.db.meetings.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 5
      })

      setMeetings(meetingsData)
      
      // Calculate stats
      const totalHours = meetingsData.reduce((sum, meeting) => sum + (meeting.duration || 0), 0) / 3600
      const thisWeekStart = new Date()
      thisWeekStart.setDate(thisWeekStart.getDate() - 7)
      
      const thisWeekMeetings = meetingsData.filter(meeting => 
        new Date(meeting.createdAt) > thisWeekStart
      )

      setStats({
        totalMeetings: meetingsData.length,
        totalHours: Math.round(totalHours * 10) / 10,
        thisWeek: thisWeekMeetings.length,
        participants: meetingsData.reduce((sum, meeting) => sum + (meeting.participants || 0), 0)
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your meeting activity</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Mic className="w-4 h-4 mr-2" />
          Start Recording
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeetings}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">Recorded content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">New meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.participants}</div>
            <p className="text-xs text-muted-foreground">Total attendees</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No meetings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first meeting recording to see it here
              </p>
              <Button>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{meeting.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatDate(meeting.createdAt)}</span>
                        <span>{formatDuration(meeting.duration)}</span>
                        <span>{meeting.participants} participants</span>
                        {meeting.hasVideo && (
                          <span className="text-accent font-medium">Video Available</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      meeting.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : meeting.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {meeting.status}
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}