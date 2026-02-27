// components/hymn-generator.tsx
'use client'

import { useState, useRef } from 'react'
import { Sparkles, Loader2, Music, Globe, Calendar, Download, Play, Pause } from 'lucide-react'
import type { Language, ChurchEventType } from '@/types'

interface HymnGeneratorProps {
  onGenerate?: (hymn: any) => void
}

export default function HymnGenerator({ onGenerate }: HymnGeneratorProps) {
  const [theme, setTheme] = useState('')
  const [language, setLanguage] = useState<Language>('english')
  const [churchEvent, setChurchEvent] = useState<ChurchEventType>('general')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLyrics, setGeneratedLyrics] = useState('')
  const [title, setTitle] = useState('')
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const languages = [
    { value: 'english', label: 'English', flag: '🇬🇧' },
    { value: 'igbo', label: 'Igbo', flag: '🇳🇬' },
    { value: 'yoruba', label: 'Yoruba', flag: '🇳🇬' },
    { value: 'hausa', label: 'Hausa', flag: '🇳🇬' },
  ]

  const events = [
    { value: 'general', label: 'General Worship' },
    { value: 'christmas', label: 'Christmas' },
    { value: 'easter', label: 'Easter' },
    { value: 'lent', label: 'Lent' },
    { value: 'advent', label: 'Advent' },
    { value: 'pentecost', label: 'Pentecost' },
  ]

  const handleGenerate = async () => {
    if (!theme.trim()) {
      alert('Please enter a theme for your hymn')
      return
    }

    setIsGenerating(true)
    setGeneratedLyrics('')
    setAudioUrl(null)
    
    try {
      const response = await fetch('/api/generate-hymn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, language, churchEvent })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setGeneratedLyrics(data.lyrics)
      setTitle(data.title)
      
      if (onGenerate) {
        onGenerate(data)
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate hymn. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!generatedLyrics) return

    setIsGeneratingAudio(true)
    
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: generatedLyrics, language })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(errorData.error || 'Audio generation failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch (error: any) {
      console.error('Audio generation error:', error)
      alert(`Failed to generate audio: ${error.message}`)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const downloadAudio = () => {
    if (!audioUrl) return

    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `${title || 'hymn'}.mp3`
    a.click()
  }

  const handleSaveHymn = async () => {
    if (!generatedLyrics || !title) {
      alert('Please generate a hymn first')
      return
    }

    setIsSaving(true)

    try {
      console.log('Attempting to save hymn...') // Debug
      
      const response = await fetch('/api/save-hymn', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies
        body: JSON.stringify({
          title,
          lyrics: generatedLyrics,
          theme,
          language,
          churchEvent
        })
      })

      const data = await response.json()
      console.log('Save response:', data) // Debug

      if (data.error) {
        if (response.status === 401) {
          const shouldRedirect = confirm('You need to sign in to save hymns. Go to login page?')
          if (shouldRedirect) {
            window.location.href = '/login?redirectTo=/create'
          }
          return
        }
        throw new Error(data.error)
      }

      if (data.success) {
        alert('Hymn saved successfully! ✅\nView it in "My Hymns"')
      }
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Failed to save hymn: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Music className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Hymn
          </h2>
          <p className="text-gray-600">
            Powered by AI - Generate custom hymns in seconds
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Theme Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hymn Theme
            </label>
            <textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., God's love and mercy, Joy of salvation, Peace in troubled times..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <p className="mt-1 text-sm text-gray-500">
              Describe the theme or message you want in your hymn
            </p>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Language
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value as Language)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    language === lang.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="text-sm font-medium">{lang.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Church Event Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Church Event (Optional)
            </label>
            <select
              value={churchEvent}
              onChange={(e) => setChurchEvent(e.target.value as ChurchEventType)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {events.map((event) => (
                <option key={event.value} value={event.value}>
                  {event.label}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !theme.trim()}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              isGenerating || !theme.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Your Hymn...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Hymn
              </>
            )}
          </button>
        </div>

        {/* Generated Lyrics Preview */}
        {generatedLyrics && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {title || 'Your Generated Hymn'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                {generatedLyrics}
              </pre>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="bg-purple-50 rounded-lg p-4 mb-6 flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Audio Preview</p>
                  <p className="text-xs text-gray-500">Generated audio ready to play</p>
                </div>
                <button
                  onClick={downloadAudio}
                  className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio || !!audioUrl}
                className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  isGeneratingAudio || audioUrl
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Audio...
                  </>
                ) : audioUrl ? (
                  <>
                    <Music className="w-5 h-5" />
                    Audio Generated ✓
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5" />
                    Generate Audio
                  </>
                )}
              </button>
              <button 
                onClick={handleSaveHymn}
                disabled={isSaving}
                className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Hymn'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}