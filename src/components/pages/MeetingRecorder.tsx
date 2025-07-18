import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Square, 
  Play, 
  Pause, 
  Download,
  Users,
  Clock,
  Settings,
  Volume2
} from 'lucide-react'
import { blink } from '../../blink/client'
import { useToast } from '../../hooks/use-toast'

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  hasAudio: boolean
  hasVideo: boolean
}

export function MeetingRecorder() {
  const [meetingTitle, setMeetingTitle] = useState('')
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    hasAudio: false,
    hasVideo: false
  })
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
      }
    }
  }, [downloadUrl])

  const startRecording = async () => {
    try {
      // Request both audio and video permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      })

      streamRef.current = stream
      
      // Display video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        
        // Create download URL
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        hasAudio: stream.getAudioTracks().length > 0,
        hasVideo: stream.getVideoTracks().length > 0
      })

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }))
      }, 1000)

      toast({
        title: "Recording Started",
        description: "Meeting recording is now active"
      })

    } catch (error) {
      console.error('Error starting recording:', error)
      toast({
        title: "Recording Failed",
        description: "Could not access camera/microphone. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = async () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop()
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false
      }))

      // Save meeting to database
      await saveMeeting()

      toast({
        title: "Recording Stopped",
        description: "Meeting has been saved successfully"
      })
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      if (recordingState.isPaused) {
        mediaRecorderRef.current.resume()
        // Resume timer
        intervalRef.current = setInterval(() => {
          setRecordingState(prev => ({
            ...prev,
            duration: prev.duration + 1
          }))
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        // Pause timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
      
      setRecordingState(prev => ({
        ...prev,
        isPaused: !prev.isPaused
      }))
    }
  }

  const saveMeeting = async () => {
    try {
      const user = await blink.auth.me()
      
      // Upload video file if available
      let videoUrl = null
      if (recordedBlob) {
        const fileName = `meeting-${Date.now()}.webm`
        const { publicUrl } = await blink.storage.upload(
          recordedBlob,
          `meetings/${user.id}/${fileName}`,
          { upsert: true }
        )
        videoUrl = publicUrl
      }

      // Save meeting record
      await blink.db.meetings.create({
        id: `meeting_${Date.now()}`,
        userId: user.id,
        title: meetingTitle || `Meeting ${new Date().toLocaleDateString()}`,
        duration: recordingState.duration,
        participants: 1, // For now, just the recorder
        hasVideo: recordingState.hasVideo,
        hasAudio: recordingState.hasAudio,
        videoUrl,
        transcription,
        status: 'completed',
        createdAt: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error saving meeting:', error)
      toast({
        title: "Save Failed",
        description: "Could not save meeting data",
        variant: "destructive"
      })
    }
  }

  const downloadVideo = () => {
    if (downloadUrl && recordedBlob) {
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${meetingTitle || 'meeting'}-${new Date().toISOString().split('T')[0]}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: "Video file is being downloaded"
      })
    }
  }

  const transcribeAudio = async () => {
    if (!recordedBlob) return
    
    setIsTranscribing(true)
    try {
      // Convert blob to base64 for transcription
      const arrayBuffer = await recordedBlob.arrayBuffer()
      const { text } = await blink.ai.transcribeAudio({
        audio: arrayBuffer,
        language: 'en'
      })
      
      setTranscription(text)
      toast({
        title: "Transcription Complete",
        description: "Audio has been transcribed successfully"
      })
    } catch (error) {
      console.error('Transcription error:', error)
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe audio",
        variant: "destructive"
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meeting Recorder</h1>
          <p className="text-muted-foreground">Record and transcribe your meetings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={recordingState.isRecording ? "destructive" : "secondary"}>
            {recordingState.isRecording ? "Recording" : "Ready"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recording Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meeting Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Meeting Title</label>
                <Input
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Enter meeting title..."
                  disabled={recordingState.isRecording}
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!recordingState.isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Click Start Recording to begin</p>
                    </div>
                  </div>
                )}
                {recordingState.isRecording && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">
                      {formatDuration(recordingState.duration)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recording Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                {!recordingState.isRecording ? (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      size="lg"
                    >
                      {recordingState.isPaused ? (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      size="lg"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Post-Recording Actions */}
          {recordedBlob && (
            <Card>
              <CardHeader>
                <CardTitle>Recording Complete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {meetingTitle || 'Untitled Meeting'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {formatDuration(recordingState.duration)}
                      </p>
                    </div>
                  </div>
                  <Button onClick={downloadVideo} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={transcribeAudio}
                    disabled={isTranscribing}
                    variant="outline"
                    className="flex-1"
                  >
                    {isTranscribing ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Generate Transcript
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recording Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Duration</span>
                <span className="font-mono text-lg">
                  {formatDuration(recordingState.duration)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Audio</span>
                <Badge variant={recordingState.hasAudio ? "default" : "secondary"}>
                  {recordingState.hasAudio ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Video</span>
                <Badge variant={recordingState.hasVideo ? "default" : "secondary"}>
                  {recordingState.hasVideo ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Live Transcription */}
          {transcription && (
            <Card>
              <CardHeader>
                <CardTitle>Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto text-sm">
                  <p className="whitespace-pre-wrap">{transcription}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}