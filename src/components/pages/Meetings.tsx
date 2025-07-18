import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { 
  Search, 
  Filter, 
  Play, 
  Download, 
  FileText, 
  Calendar,
  Clock,
  Users,
  Video,
  Mic
} from 'lucide-react'
import { blink } from '../../blink/client'
import { useToast } from '../../hooks/use-toast'

interface Meeting {
  id: string
  title: string
  duration: number
  participants: number
  createdAt: string
  status: 'completed' | 'processing' | 'failed'
  hasVideo: boolean
  hasAudio: boolean
  videoUrl?: string
  transcription?: string
}

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    loadMeetings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Filter meetings based on search query
    const filtered = meetings.filter(meeting =>
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.transcription?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMeetings(filtered)
  }, [meetings, searchQuery])

  const loadMeetings = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      // Try to load from database, fallback to sample data if database doesn't exist
      try {
        const meetingsData = await blink.db.meetings.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
        
        setMeetings(meetingsData)
        setFilteredMeetings(meetingsData)
      } catch (dbError) {
        console.log('Database not available, using sample data for demo')
        
        // Sample data for demonstration
        const sampleMeetings: Meeting[] = [
          {
            id: 'sample_1',
            title: 'Weekly Team Standup',
            duration: 1800, // 30 minutes
            participants: 5,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            hasVideo: true,
            hasAudio: true,
            videoUrl: 'https://sample-video-url.com/standup.webm',
            transcription: 'Good morning everyone. Let\'s start with our weekly standup. John, can you share what you worked on this week? I focused on the user authentication system and completed the login flow. The new design looks great and user feedback has been positive. Sarah, what about you? I worked on the database optimization and we\'re seeing 40% faster query times now. That\'s excellent progress. Any blockers for next week? No major blockers, just need to coordinate with the design team on the new dashboard layout.'
          },
          {
            id: 'sample_2',
            title: 'Product Planning Session',
            duration: 3600, // 1 hour
            participants: 8,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            hasVideo: false,
            hasAudio: true,
            transcription: 'Welcome to our quarterly product planning session. Today we\'ll be discussing our roadmap for Q2 and prioritizing features based on user feedback. Let\'s start by reviewing the analytics from last quarter. Our user engagement is up 25% and we\'ve seen strong adoption of the new collaboration features. The top requested features from our users are: advanced search functionality, mobile app improvements, and better integration with third-party tools. Let\'s break these down and estimate the effort required for each.'
          },
          {
            id: 'sample_3',
            title: 'Client Presentation - Acme Corp',
            duration: 2700, // 45 minutes
            participants: 3,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'processing',
            hasVideo: true,
            hasAudio: true,
            videoUrl: 'https://sample-video-url.com/client-presentation.webm',
            transcription: 'Thank you for joining us today. We\'re excited to present our solution for Acme Corp\'s digital transformation initiative. Our platform offers three key benefits: streamlined workflows, real-time collaboration, and comprehensive analytics. Let me walk you through a demo of how this would work for your team...'
          },
          {
            id: 'sample_4',
            title: 'Engineering All-Hands',
            duration: 4200, // 70 minutes
            participants: 12,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            hasVideo: true,
            hasAudio: true,
            transcription: 'Good afternoon engineering team. Today\'s all-hands covers our technical roadmap, recent achievements, and upcoming challenges. First, congratulations on successfully migrating to the new infrastructure - we\'ve seen 99.9% uptime since the migration. Our performance metrics are looking great with average response times under 200ms. Looking ahead, we have three major initiatives: implementing microservices architecture, upgrading our CI/CD pipeline, and enhancing our monitoring and alerting systems.'
          },
          {
            id: 'sample_5',
            title: 'Design Review - Mobile App',
            duration: 2100, // 35 minutes
            participants: 6,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            hasVideo: false,
            hasAudio: true,
            transcription: 'Let\'s review the latest mobile app designs. The new onboarding flow looks much cleaner and user testing shows a 30% improvement in completion rates. The navigation has been simplified and we\'ve reduced the number of steps to complete key actions. One concern is the color contrast on the secondary buttons - we should make sure they meet accessibility standards. Overall, this is a significant improvement over the previous version.'
          }
        ]
        
        setMeetings(sampleMeetings)
        setFilteredMeetings(sampleMeetings)
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
      toast({
        title: "Load Failed",
        description: "Could not load meetings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadVideo = async (meeting: Meeting) => {
    if (!meeting.videoUrl) {
      toast({
        title: "No Video",
        description: "This meeting doesn't have a video recording",
        variant: "destructive"
      })
      return
    }

    try {
      // Create a temporary link to download the video
      const a = document.createElement('a')
      a.href = meeting.videoUrl
      a.download = `${meeting.title}-${new Date(meeting.createdAt).toISOString().split('T')[0]}.webm`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: "Video download has been initiated"
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: "Download Failed",
        description: "Could not download video",
        variant: "destructive"
      })
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meetings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">View and manage your recorded meetings</p>
        </div>
        <Button>
          <Mic className="w-4 h-4 mr-2" />
          New Recording
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search meetings or transcripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No meetings found' : 'No meetings yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start recording your first meeting to see it here'
                }
              </p>
              {!searchQuery && (
                <Button>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {meeting.hasVideo ? (
                          <Video className="w-6 h-6 text-primary" />
                        ) : (
                          <Mic className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{meeting.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(meeting.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(meeting.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{meeting.participants} participants</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Features */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}>
                        {meeting.status}
                      </Badge>
                      {meeting.hasVideo && (
                        <Badge variant="outline">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </Badge>
                      )}
                      {meeting.hasAudio && (
                        <Badge variant="outline">
                          <Mic className="w-3 h-3 mr-1" />
                          Audio
                        </Badge>
                      )}
                      {meeting.transcription && (
                        <Badge variant="outline">
                          <FileText className="w-3 h-3 mr-1" />
                          Transcript
                        </Badge>
                      )}
                    </div>

                    {/* Transcript Preview */}
                    {meeting.transcription && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {meeting.transcription.substring(0, 200)}
                          {meeting.transcription.length > 200 && '...'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMeeting(meeting)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {meeting.hasVideo && meeting.videoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadVideo(meeting)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedMeeting.title}</CardTitle>
                <p className="text-muted-foreground">
                  {formatDate(selectedMeeting.createdAt)} • {formatDuration(selectedMeeting.duration)}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedMeeting(null)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Player */}
              {selectedMeeting.hasVideo && selectedMeeting.videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    src={selectedMeeting.videoUrl}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              )}

              {/* Transcript */}
              {selectedMeeting.transcription && (
                <div>
                  <h4 className="font-semibold mb-3">Transcript</h4>
                  <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">
                      {selectedMeeting.transcription}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                {selectedMeeting.hasVideo && selectedMeeting.videoUrl && (
                  <Button
                    variant="outline"
                    onClick={() => downloadVideo(selectedMeeting)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                )}
                <Button onClick={() => setSelectedMeeting(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}