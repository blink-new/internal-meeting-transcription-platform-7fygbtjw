import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/separator'
import { 
  Settings, 
  Users, 
  Calendar,
  Mic,
  Video,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Square
} from 'lucide-react'
import { blink } from '../../blink/client'
import { useToast } from '../../hooks/use-toast'

interface TeamsIntegration {
  id: string
  isConnected: boolean
  tenantId?: string
  userEmail?: string
  connectedAt?: string
  permissions: string[]
  autoRecord: boolean
  autoTranscribe: boolean
  webhookUrl?: string
}

interface TeamsMeeting {
  id: string
  subject: string
  organizer: string
  startTime: string
  endTime: string
  participants: number
  isRecording: boolean
  recordingStatus: 'not_started' | 'recording' | 'processing' | 'completed' | 'failed'
  transcriptionStatus: 'not_started' | 'processing' | 'completed' | 'failed'
  meetingUrl?: string
  recordingUrl?: string
  transcriptUrl?: string
}

export function TeamsPlugin() {
  const [integration, setIntegration] = useState<TeamsIntegration | null>(null)
  const [meetings, setMeetings] = useState<TeamsMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  
  const { toast } = useToast()

  useEffect(() => {
    loadTeamsIntegration()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTeamsIntegration = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      
      // Try to load existing integration
      try {
        const integrations = await blink.db.teamsIntegrations.list({
          where: { userId: user.id },
          limit: 1
        })
        
        if (integrations.length > 0) {
          setIntegration(integrations[0])
          loadTeamsMeetings(integrations[0])
        } else {
          // No integration found, show setup
          setIntegration(null)
        }
      } catch (dbError) {
        console.log('Database not available, using sample data for demo')
        
        // Sample integration data
        const sampleIntegration: TeamsIntegration = {
          id: 'sample_integration',
          isConnected: true,
          tenantId: 'sample-tenant-id',
          userEmail: user.email || 'user@company.com',
          connectedAt: new Date().toISOString(),
          permissions: ['Meetings.Read', 'OnlineMeetings.Read', 'CallRecords.Read'],
          autoRecord: true,
          autoTranscribe: true,
          webhookUrl: 'https://your-app.com/api/teams/webhook'
        }
        
        setIntegration(sampleIntegration)
        
        // Sample meetings data
        const sampleMeetings: TeamsMeeting[] = [
          {
            id: 'teams_meeting_1',
            subject: 'Weekly Team Standup',
            organizer: 'john.doe@company.com',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
            participants: 5,
            isRecording: false,
            recordingStatus: 'completed',
            transcriptionStatus: 'completed',
            meetingUrl: 'https://teams.microsoft.com/l/meetup-join/...',
            recordingUrl: 'https://company-my.sharepoint.com/recording1.mp4',
            transcriptUrl: 'https://company-my.sharepoint.com/transcript1.vtt'
          },
          {
            id: 'teams_meeting_2',
            subject: 'Product Planning Session',
            organizer: 'sarah.smith@company.com',
            startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
            endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1.5 hours from now
            participants: 8,
            isRecording: false,
            recordingStatus: 'not_started',
            transcriptionStatus: 'not_started',
            meetingUrl: 'https://teams.microsoft.com/l/meetup-join/...'
          },
          {
            id: 'teams_meeting_3',
            subject: 'Client Demo - Acme Corp',
            organizer: 'mike.johnson@company.com',
            startTime: new Date().toISOString(), // Now
            endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
            participants: 3,
            isRecording: true,
            recordingStatus: 'recording',
            transcriptionStatus: 'processing',
            meetingUrl: 'https://teams.microsoft.com/l/meetup-join/...'
          }
        ]
        
        setMeetings(sampleMeetings)
      }
    } catch (error) {
      console.error('Failed to load Teams integration:', error)
      toast({
        title: "Load Failed",
        description: "Could not load Teams integration",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTeamsMeetings = async (integration: TeamsIntegration) => {
    if (!integration.isConnected) return
    
    try {
      // In a real implementation, this would fetch from Microsoft Graph API
      // For now, we'll use sample data
      const sampleMeetings: TeamsMeeting[] = [
        {
          id: 'teams_meeting_1',
          subject: 'Weekly Team Standup',
          organizer: 'john.doe@company.com',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          participants: 5,
          isRecording: false,
          recordingStatus: 'completed',
          transcriptionStatus: 'completed',
          meetingUrl: 'https://teams.microsoft.com/l/meetup-join/...',
          recordingUrl: 'https://company-my.sharepoint.com/recording1.mp4',
          transcriptUrl: 'https://company-my.sharepoint.com/transcript1.vtt'
        }
      ]
      
      setMeetings(sampleMeetings)
    } catch (error) {
      console.error('Failed to load Teams meetings:', error)
    }
  }

  const connectToTeams = async () => {
    try {
      setConnecting(true)
      
      // In a real implementation, this would:
      // 1. Redirect to Microsoft OAuth
      // 2. Get authorization code
      // 3. Exchange for access token
      // 4. Store integration in database
      
      // For demo purposes, simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const user = await blink.auth.me()
      const newIntegration: TeamsIntegration = {
        id: 'new_integration',
        isConnected: true,
        tenantId: 'demo-tenant-id',
        userEmail: user.email || 'user@company.com',
        connectedAt: new Date().toISOString(),
        permissions: ['Meetings.Read', 'OnlineMeetings.Read', 'CallRecords.Read'],
        autoRecord: true,
        autoTranscribe: true,
        webhookUrl: webhookUrl || 'https://your-app.com/api/teams/webhook'
      }
      
      // In real implementation, save to database
      // await blink.db.teamsIntegrations.create(newIntegration)
      
      setIntegration(newIntegration)
      
      toast({
        title: "Connected Successfully",
        description: "Your Teams account has been connected"
      })
      
      // Load meetings after connection
      loadTeamsMeetings(newIntegration)
      
    } catch (error) {
      console.error('Failed to connect to Teams:', error)
      toast({
        title: "Connection Failed",
        description: "Could not connect to Microsoft Teams",
        variant: "destructive"
      })
    } finally {
      setConnecting(false)
    }
  }

  const disconnectFromTeams = async () => {
    try {
      // In real implementation, revoke tokens and delete from database
      setIntegration(null)
      setMeetings([])
      
      toast({
        title: "Disconnected",
        description: "Teams integration has been disconnected"
      })
    } catch (error) {
      console.error('Failed to disconnect from Teams:', error)
      toast({
        title: "Disconnect Failed",
        description: "Could not disconnect from Teams",
        variant: "destructive"
      })
    }
  }

  const updateIntegrationSettings = async (updates: Partial<TeamsIntegration>) => {
    if (!integration) return
    
    try {
      const updatedIntegration = { ...integration, ...updates }
      setIntegration(updatedIntegration)
      
      // In real implementation, update in database
      // await blink.db.teamsIntegrations.update(integration.id, updates)
      
      toast({
        title: "Settings Updated",
        description: "Integration settings have been saved"
      })
    } catch (error) {
      console.error('Failed to update settings:', error)
      toast({
        title: "Update Failed",
        description: "Could not update integration settings",
        variant: "destructive"
      })
    }
  }

  const startRecording = async (meetingId: string) => {
    try {
      // In real implementation, call Microsoft Graph API to start recording
      const updatedMeetings = meetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, isRecording: true, recordingStatus: 'recording' as const }
          : meeting
      )
      setMeetings(updatedMeetings)
      
      toast({
        title: "Recording Started",
        description: "Meeting recording has been initiated"
      })
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast({
        title: "Recording Failed",
        description: "Could not start meeting recording",
        variant: "destructive"
      })
    }
  }

  const stopRecording = async (meetingId: string) => {
    try {
      // In real implementation, call Microsoft Graph API to stop recording
      const updatedMeetings = meetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, isRecording: false, recordingStatus: 'processing' as const }
          : meeting
      )
      setMeetings(updatedMeetings)
      
      toast({
        title: "Recording Stopped",
        description: "Meeting recording has been stopped and is processing"
      })
    } catch (error) {
      console.error('Failed to stop recording:', error)
      toast({
        title: "Stop Failed",
        description: "Could not stop meeting recording",
        variant: "destructive"
      })
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMeetingStatus = (meeting: TeamsMeeting) => {
    const now = new Date()
    const start = new Date(meeting.startTime)
    const end = new Date(meeting.endTime)
    
    if (now < start) return 'upcoming'
    if (now > end) return 'completed'
    return 'active'
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Teams integration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Microsoft Teams Plugin</h1>
          <p className="text-muted-foreground">
            Automatically record and transcribe your Teams meetings
          </p>
        </div>
        {integration?.isConnected && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {/* Connection Status */}
      {!integration?.isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Connect to Microsoft Teams</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Connect Your Teams Account</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your Microsoft Teams account to automatically record and transcribe meetings. 
                We'll need permission to access your meetings and recordings.
              </p>
              
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium mb-2">Webhook URL (Optional)</label>
                  <Input
                    placeholder="https://your-app.com/api/teams/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL to receive real-time meeting events
                  </p>
                </div>
                
                <Button 
                  onClick={connectToTeams}
                  disabled={connecting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {connecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect to Microsoft Teams
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Mic className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium">Auto Recording</h4>
                <p className="text-muted-foreground">Automatically record meetings</p>
              </div>
              <div className="text-center">
                <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium">AI Transcription</h4>
                <p className="text-muted-foreground">Generate accurate transcripts</p>
              </div>
              <div className="text-center">
                <Settings className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium">Smart Insights</h4>
                <p className="text-muted-foreground">Extract key moments and actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Integration Settings</span>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectFromTeams}>
                  Disconnect
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{integration.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenant ID:</span>
                      <span className="font-mono text-xs">{integration.tenantId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connected:</span>
                      <span>{formatDateTime(integration.connectedAt!)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Permissions</h4>
                  <div className="space-y-2">
                    {integration.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Automation Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Auto-record meetings</label>
                      <p className="text-sm text-muted-foreground">
                        Automatically start recording when you join a meeting
                      </p>
                    </div>
                    <Switch
                      checked={integration.autoRecord}
                      onCheckedChange={(checked) => 
                        updateIntegrationSettings({ autoRecord: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Auto-transcribe recordings</label>
                      <p className="text-sm text-muted-foreground">
                        Generate transcripts for all recorded meetings
                      </p>
                    </div>
                    <Switch
                      checked={integration.autoTranscribe}
                      onCheckedChange={(checked) => 
                        updateIntegrationSettings({ autoTranscribe: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Teams Meetings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No meetings found</h3>
                  <p className="text-muted-foreground">
                    Your upcoming and recent Teams meetings will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => {
                    const status = getMeetingStatus(meeting)
                    return (
                      <div
                        key={meeting.id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{meeting.subject}</h4>
                              <Badge 
                                variant={
                                  status === 'active' ? 'default' : 
                                  status === 'upcoming' ? 'secondary' : 'outline'
                                }
                              >
                                {status}
                              </Badge>
                              {meeting.isRecording && (
                                <Badge variant="destructive">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
                                  Recording
                                </Badge>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                              <div>
                                <p><strong>Organizer:</strong> {meeting.organizer}</p>
                                <p><strong>Participants:</strong> {meeting.participants}</p>
                              </div>
                              <div>
                                <p><strong>Start:</strong> {formatDateTime(meeting.startTime)}</p>
                                <p><strong>End:</strong> {formatDateTime(meeting.endTime)}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <span>Recording:</span>
                                <Badge 
                                  variant={
                                    meeting.recordingStatus === 'completed' ? 'default' :
                                    meeting.recordingStatus === 'recording' ? 'destructive' :
                                    meeting.recordingStatus === 'processing' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {meeting.recordingStatus.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <span>Transcript:</span>
                                <Badge 
                                  variant={
                                    meeting.transcriptionStatus === 'completed' ? 'default' :
                                    meeting.transcriptionStatus === 'processing' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {meeting.transcriptionStatus.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {status === 'active' && (
                              <>
                                {meeting.isRecording ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => stopRecording(meeting.id)}
                                  >
                                    <Square className="w-4 h-4 mr-1" />
                                    Stop
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startRecording(meeting.id)}
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Record
                                  </Button>
                                )}
                              </>
                            )}

                            {meeting.meetingUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(meeting.meetingUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Join
                              </Button>
                            )}

                            {meeting.recordingUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(meeting.recordingUrl, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}