'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Share,
  Palette,
  Crown,
  Copy,
  Layers,
  Zap,
  FileImage,
  Volume2,
  VolumeX,
  Video,
  Loader,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  BookOpen,
  User,
  Clock,
  Eye,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';

interface ComicPanel {
  imageUrl: any;
  id: number;
  imageDescription: string;
  dialogue: string[];
  narration: string;
  characterEmotions: string;
  sceneAction: string;
  visualElements: string[];
  continuityNotes: string;
  audioUrl?: string;
  audioDuration?: number;
}

interface ComicStory {
  title: string;
  characterProfile: {
    name: string;
    appearance: string;
    personality: string;
    backstory: string;
    motivation: string;
  };
  storyArc: string;
  panels: ComicPanel[];
}

interface Comic {
  success: boolean;
  comic: ComicStory;
  generationTime: number;
}

interface ComicOutputProps {
  comic: Comic;
  onCreateAnother: () => void;
  isProUser: boolean;
  onUpgrade: () => void;
}

const ComicOutput: React.FC<ComicOutputProps> = ({ comic, onCreateAnother, isProUser, onUpgrade }) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [readingMode, setReadingMode] = useState<'single' | 'grid' | 'story'>('single');
  const [showCharacterInfo, setShowCharacterInfo] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const story = comic.comic;
  const panels = story.panels;

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isPlaying) {
      autoPlayTimerRef.current = setTimeout(() => {
        if (currentPanel < panels.length - 1) {
          setCurrentPanel((prev) => prev + 1);
        } else {
          setIsAutoPlaying(false);
          toast.success('Story complete!');
        }
      }, 4000); // 4 seconds per panel
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [currentPanel, isAutoPlaying, isPlaying, panels.length]);

  const nextPanel = () => {
    if (currentPanel < panels.length - 1) {
      setCurrentPanel((prev) => prev + 1);
    }
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      setCurrentPanel((prev) => prev - 1);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    if (!isAutoPlaying) {
      toast.success('Auto-play started');
    } else {
      toast.success('Auto-play stopped');
    }
  };

  // ✅ FIXED: Sequential processing to respect ElevenLabs rate limits
  const addVoiceNarration = async () => {
    setIsGeneratingNarration(true);
    let loadingToast = toast.loading('Starting voice narration generation...');

    try {
      const updatedPanels = [...panels];
      let successCount = 0;

      // ✅ Process panels ONE BY ONE to avoid 429 errors
      for (let index = 0; index < panels.length; index++) {
        const panel = panels[index];
        const text = `${panel.narration} ${panel.dialogue.join(' ')}`.trim();

        if (!text) {
          console.log(`Skipping panel ${index + 1} - no text content`);
          continue;
        }

        try {
          // Update progress toast
          toast.dismiss(loadingToast);
          loadingToast = toast.loading(`🎙️ Generating voice for panel ${index + 1} of ${panels.length}...`);

          console.log(`Generating narration for panel ${index + 1}:`, text.substring(0, 100));

          const response = await axios.post(
            '/api/generate-narration',
            {
              text,
              voiceType: 'narrative',
              speed: 1.0,
            },
            {
              timeout: 30000, // 30 second timeout
            }
          );

          if (response.data.success) {
            updatedPanels[index].audioUrl = response.data.audioUrl;
            updatedPanels[index].audioDuration = response.data.duration;
            successCount++;

            toast.dismiss(loadingToast);
            loadingToast = toast.success(`✅ Panel ${index + 1} voice ready!`, { duration: 1000 });

            console.log(`Panel ${index + 1} narration generated successfully`);
          } else {
            throw new Error(response.data.error || 'Unknown error');
          }

          // ✅ Wait 2 seconds between requests to respect rate limits
          if (index < panels.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } catch (error: any) {
          console.error(`Failed to generate narration for panel ${index + 1}:`, error);

          const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
          toast.dismiss(loadingToast);
          loadingToast = toast.error(`❌ Panel ${index + 1} failed: ${errorMessage}`, { duration: 2000 });

          // ✅ If rate limited, wait longer before next attempt
          if (error?.response?.status === 429) {
            console.log('Rate limited, waiting 5 seconds...');
            toast.dismiss(loadingToast);
            loadingToast = toast.loading('⏳ Rate limited - waiting 5 seconds...');
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } else {
            // Wait 1 second before next attempt for other errors
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      // ✅ Force component re-render with updated panels
      comic.comic.panels = updatedPanels;

      toast.dismiss(loadingToast);

      if (successCount > 0) {
        toast.success(`🎵 Voice narration added to ${successCount} of ${panels.length} panels!`);
        // Force re-render by updating state
        setCurrentPanel((prev) => prev);
      } else {
        toast.error('Failed to generate any narration. Please try again.');
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Overall narration generation failed:', error);
      toast.error('Voice narration failed. Please check your internet connection.');
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const handleDownload = async () => {
    if (!isProUser) {
      toast.error('Download feature requires Pro subscription');
      onUpgrade();
      return;
    }

    setIsDownloading(true);
    const loadingToast = toast.loading('Generating PDF download...');

    try {
      // Create a simple PDF-style content
      const storyContent = [
        `${story.title}\n`,
        `Character: ${story.characterProfile.name}`,
        `Story: ${story.storyArc}\n`,
        ...panels.map((panel, index) => `Panel ${index + 1}:\n${panel.narration}\n${panel.dialogue.join('\n')}\n`),
      ].join('\n');

      // Create and download text file (since we don't have PDF API)
      const blob = new Blob([storyContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success('Story downloaded successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Download failed:', error);
      toast.error('Failed to download story');
    } finally {
      setIsDownloading(false);
    }
  };
  const handleShare = async () => {
    try {
      const shareData = {
        title: story.title,
        text: `Check out my AI-generated comic: ${story.title}\n\n${story.storyArc}`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${story.title}\n\n${story.storyArc}\n\n${window.location.href}`);
        toast.success('Comic details copied to clipboard!');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Failed to share comic');
      }
    }
  };

  const generateAllNarration = async () => {
    if (!isProUser) {
      onUpgrade();
      return;
    }

    setIsGeneratingNarration(true);
    const loadingToast = toast.loading('Generating narration for all panels...');

    try {
      const narrationPromises = panels.map(async (panel, index) => {
        const text = `${panel.narration} ${panel.dialogue.join(' ')}`.trim();
        if (!text) return null;

        try {
          const response = await axios.post('/api/generate-narration', {
            text,
            voiceType: 'narrative',
            speed: 1.0,
          });

          return response.data.success
            ? {
                index,
                audioUrl: response.data.audioUrl,
                duration: response.data.duration,
              }
            : null;
        } catch (error) {
          console.error(`Failed to generate narration for panel ${index + 1}:`, error);
          return null;
        }
      });

      const results = await Promise.all(narrationPromises);

      // Update panels with audio data
      let successCount = 0;
      results.forEach((result) => {
        if (result && result.index !== undefined) {
          panels[result.index].audioUrl = result.audioUrl;
          panels[result.index].audioDuration = result.duration;
          successCount++;
        }
      });

      toast.dismiss(loadingToast);
      if (successCount > 0) {
        toast.success(`🎵 Narration generated for ${successCount} panels!`);
      } else {
        toast.error('Failed to generate narration');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Narration generation failed:', error);
      toast.error('Failed to generate narration');
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const generateVideo = async () => {
    if (!isProUser) {
      onUpgrade();
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const response = await axios.post('/api/generate-video', {
        comic: story,
        includeNarration: true,
        transitions: 'fade',
        duration: 'auto',
      });

      if (response.data.success) {
        setVideoUrl(response.data.videoUrl);
        toast.success('Video generated successfully!');
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      toast.error('Failed to generate video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const togglePanelAudio = async () => {
    const panel = panels[currentPanel];

    if (!panel?.audioUrl) {
      toast.error('No audio available for this panel');
      return;
    }

    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }

      if (isPlaying) {
        setIsPlaying(false);
      } else {
        // Create new audio instance
        const audio = new Audio();

        // Handle audio events
        const loadingToast = toast.loading('Loading audio...');

        audio.oncanplaythrough = () => {
          toast.dismiss(loadingToast);
          audio.play().catch((err) => {
            console.error('Audio play error:', err);
            toast.error('Failed to play audio');
            setIsPlaying(false);
          });
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          // Auto-advance to next panel if auto-playing
          if (isAutoPlaying && currentPanel < panels.length - 1) {
            setCurrentPanel((prev) => prev + 1);
          }
        };

        audio.onerror = () => {
          toast.dismiss(loadingToast);
          // toast.error('Audio format not supported');
          setIsPlaying(false);
          setCurrentAudio(null);
        };

        // Set audio source and load
        audio.src = panel.audioUrl;
        audio.load();

        setCurrentAudio(audio);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio error:', error);
      toast.error('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const copyStoryText = async () => {
    const storyText = [
      `${story.title}\n`,
      `Character: ${story.characterProfile.name}`,
      `Story: ${story.storyArc}\n`,
      ...panels.map((panel, index) => `Panel ${index + 1}:\n${panel.narration}\n${panel.dialogue.join('\n')}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(storyText);
      toast.success('Complete story copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy story text');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const regeneratePanel = async (panelIndex: number) => {
    if (!isProUser) {
      onUpgrade();
      return;
    }

    toast.loading('Regenerating panel...');
    try {
      // This would call your API to regenerate a specific panel
      // Implementation depends on your backend capabilities
      toast.success('Panel regenerated!');
    } catch (error) {
      toast.error('Failed to regenerate panel');
    }
  };

  const renderPanelContent = (panel: ComicPanel, index: number) => (
    <motion.div
      key={`panel-${index}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl border border-white/10 overflow-hidden group ${
        isFullscreen ? 'aspect-video' : 'aspect-[4/3]'
      }`}
    >
      {/* Panel Image or Placeholder */}
      {panel.imageUrl ? (
        <div className="relative w-full h-full">
          <Image
            src={panel.imageUrl}
            alt={`Panel ${index + 1}`}
            fill
            className="object-cover"
            unoptimized
            onError={() => {
              console.error('Image failed to load');
            }}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20">
          <div className="text-center space-y-4 p-8">
            <FileImage className="w-16 h-16 text-white/50 mx-auto" />
            <div className="space-y-2">
              <p className="text-white/60 font-medium">Panel {index + 1}</p>
              <p className="text-sm text-white/40 max-w-md leading-relaxed">{panel?.imageDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Controls - Only in Single Panel Mode */}
      {readingMode === 'single' && (
        <>
          <button
            onClick={prevPanel}
            disabled={index === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextPanel}
            disabled={index === panels.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Panel Controls - Top Right */}
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        {isProUser && (
          <button
            onClick={() => regeneratePanel(index)}
            className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-all"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Panel Indicator - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">
          {index + 1} / {panels.length}
        </span>
      </div>

      {/* Audio Indicator - Bottom Left */}
      {panel.audioUrl && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-full p-2">
          <Volume2 className="w-4 h-4 text-green-400" />
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Video Section */}
        {videoUrl && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/20">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-cover"
                poster={panels[0]?.imageDescription}
              >
                Your browser doesn't support video playback.
              </video>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-purple-600/5 via-pink-600/10 to-cyan-600/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-8 text-center border-b border-white/10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2 mb-4"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-300">Comic Ready!</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{story.title}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{story.storyArc}</p>

            {/* Character Info Toggle */}
            <button
              onClick={() => setShowCharacterInfo(!showCharacterInfo)}
              className="mt-4 inline-flex items-center space-x-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>About {story.characterProfile.name}</span>
            </button>

            {/* Character Profile */}
            <AnimatePresence>
              {showCharacterInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left max-w-2xl mx-auto"
                >
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Character</h4>
                      <p className="text-gray-300 mb-2">{story.characterProfile.name}</p>
                      <p className="text-gray-400">{story.characterProfile.personality}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Motivation</h4>
                      <p className="text-gray-400">{story.characterProfile.motivation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Generated in {comic.generationTime}ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Layers className="w-4 h-4" />
                <span>{panels.length} panels</span>
              </div>
            </div>
          </div>

          {/* Reading Mode Selector */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-400">Reading Mode:</span>
              {[
                { id: 'single', label: 'Single Panel', icon: Eye },
                { id: 'grid', label: 'Grid View', icon: Layers },
                { id: 'story', label: 'Story View', icon: BookOpen },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setReadingMode(mode.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    readingMode === mode.id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 border border-white/10'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="text-sm">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comic Content */}
          <div className="relative p-8">
            {readingMode === 'single' && (
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {panels.length > 0 && renderPanelContent(panels[currentPanel], currentPanel)}
                </AnimatePresence>

                {/* Panel Text */}
                <motion.div
                  key={`text-${currentPanel}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  {panels[currentPanel].narration && (
                    <div className="mb-4">
                      <p className="text-white text-lg leading-relaxed">{panels[currentPanel].narration}</p>
                    </div>
                  )}

                  {panels[currentPanel].dialogue.length > 0 && (
                    <div className="space-y-2">
                      {panels[currentPanel].dialogue.map((line, index) => (
                        <div key={index} className="bg-white/5 rounded-xl px-4 py-2">
                          <p className="text-purple-300 font-medium">"{line}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {panels[currentPanel].characterEmotions && (
                    <div className="mt-4 text-sm text-gray-400">
                      <span className="font-medium">Emotion:</span> {panels[currentPanel].characterEmotions}
                    </div>
                  )}
                </motion.div>

                {/* Thumbnail Navigation */}
                {panels.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto p-2">
                    {panels.map((panel, index) => (
                      <button
                        key={panel.id}
                        onClick={() => setCurrentPanel(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-xl border-2 transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 ${
                          index === currentPanel
                            ? 'border-purple-400 scale-105'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <span className="text-white text-sm font-medium">{index + 1}</span>
                        {panel.audioUrl && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {readingMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {panels.map((panel, index) => (
                  <div key={panel.id} className="space-y-4">
                    {renderPanelContent(panel, index)}
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <p className="text-white text-sm leading-relaxed">{panel.narration}</p>
                      {panel.dialogue.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {panel.dialogue.map((line, i) => (
                            <p key={i} className="text-purple-300 text-sm">
                              "{line}"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {readingMode === 'story' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                {panels.map((panel, index) => (
                  <motion.div
                    key={panel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="grid lg:grid-cols-2 gap-8 items-center"
                  >
                    <div className={index % 2 === 1 ? 'lg:order-2' : ''}>{renderPanelContent(panel, index)}</div>
                    <div className={`space-y-4 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Panel {index + 1}</h3>
                        <p className="text-white leading-relaxed mb-4">{panel.narration}</p>
                        {panel.dialogue.length > 0 && (
                          <div className="space-y-2">
                            {panel.dialogue.map((line, i) => (
                              <div key={i} className="bg-white/5 rounded-xl px-4 py-2">
                                <p className="text-purple-300">"{line}"</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {panel.audioUrl && (
                          <button
                            onClick={() => {
                              setCurrentPanel(index);
                              togglePanelAudio();
                            }}
                            className="mt-4 flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>Listen to this panel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Playback Controls */}
          {readingMode === 'single' && (
            <div className="px-8 py-4 border-t border-white/10">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setCurrentPanel(0)}
                  disabled={currentPanel === 0}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={prevPanel}
                  disabled={currentPanel === 0}
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={toggleAutoPlay}
                  className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-all"
                >
                  {isAutoPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
                </button>

                <button
                  onClick={nextPanel}
                  disabled={currentPanel === panels.length - 1}
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setCurrentPanel(panels.length - 1)}
                  disabled={currentPanel === panels.length - 1}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-30"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-8 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* ✅ Add Voice Narration Button - Only show if NO panels have audio */}
              {!panels.some((p) => p.audioUrl) && (
                <motion.button
                  onClick={addVoiceNarration}
                  disabled={isGeneratingNarration}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingNarration ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                  <span>
                    {isGeneratingNarration
                      ? 'Adding Voice...'
                      : !isProUser
                      ? 'Add Voice Narration (Pro)'
                      : 'Add Voice Narration'}
                  </span>
                  {!isProUser && <Crown className="w-4 h-4 text-yellow-400" />}
                </motion.button>
              )}

              {/* ✅ Current Panel Audio Toggle - Only show if current panel has audio */}
              {panels[currentPanel]?.audioUrl && (
                <motion.button
                  onClick={togglePanelAudio}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 border border-green-400/50 text-green-300 hover:bg-green-400/10 hover:border-green-400/70 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                    isPlaying ? 'bg-green-400/20' : ''
                  }`}
                >
                  {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span>{isPlaying ? 'Stop Audio' : 'Play Audio'}</span>
                </motion.button>
              )}

              {/* Generate Video Button */}
              {!videoUrl && (
                <motion.button
                  onClick={generateVideo}
                  disabled={isGeneratingVideo}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingVideo ? <Loader className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                  <span>
                    {isGeneratingVideo ? 'Creating Video...' : !isProUser ? 'Generate Video (Pro)' : 'Generate Video'}
                  </span>
                  {!isProUser && <Crown className="w-4 h-4 text-yellow-400" />}
                </motion.button>
              )}

              {/* ✅ FIXED: Download Button */}
              <motion.button
                onClick={handleDownload}
                disabled={isDownloading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                <span>{isDownloading ? 'Downloading...' : !isProUser ? 'Download Story (Pro)' : 'Download Story'}</span>
                {!isProUser && <Crown className="w-4 h-4 text-yellow-400" />}
              </motion.button>

              {/* Share Button */}
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300"
              >
                <Share className="w-5 h-5" />
                <span>Share Comic</span>
              </motion.button>

              {/* Copy Story Text Button */}
              <motion.button
                onClick={copyStoryText}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Story</span>
              </motion.button>

              {/* ✅ FIXED: Create Another Button */}
              <motion.button
                onClick={() => {
                  console.log('Create Another clicked');
                  onCreateAnother();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300"
              >
                <Palette className="w-5 h-5" />
                <span>Create Another</span>
              </motion.button>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="p-8 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                {
                  label: 'Panels',
                  value: panels.length,
                  icon: Layers,
                  color: 'from-blue-600/20 to-blue-500/20',
                  iconColor: 'text-blue-400',
                },
                {
                  label: 'Character',
                  value: story.characterProfile.name,
                  icon: User,
                  color: 'from-purple-600/20 to-purple-500/20',
                  iconColor: 'text-purple-400',
                },
                {
                  label: 'With Audio',
                  value: panels.filter((p) => p.audioUrl).length,
                  icon: Volume2,
                  color: 'from-green-600/20 to-green-500/20',
                  iconColor: 'text-green-400',
                },
                {
                  label: 'Generation Time',
                  value: `${comic.generationTime}ms`,
                  icon: Zap,
                  color: 'from-yellow-600/20 to-yellow-500/20',
                  iconColor: 'text-yellow-400',
                },
                {
                  label: 'Story Arc',
                  value: 'Complete',
                  icon: BookOpen,
                  color: 'from-pink-600/20 to-pink-500/20',
                  iconColor: 'text-pink-400',
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
                >
                  <div className={`inline-flex p-2 rounded-xl bg-gradient-to-r ${stat.color} mb-2`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className="text-white font-semibold text-sm truncate" title={stat.value.toString()}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pro Upgrade CTA */}
          {!isProUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="m-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm rounded-2xl p-6 text-center border"
            >
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Unlock Pro Features</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Get high-resolution downloads, unlimited comics, video generation, voice narration, and exclusive art
                styles
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div className="bg-white/5 rounded-xl p-3">
                  <Download className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-medium">PDF Downloads</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <Video className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <div className="text-white font-medium">Video Generation</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <Volume2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-medium">Voice Narration</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <RefreshCw className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-white font-medium">Panel Regeneration</div>
                </div>
              </div>
              <button
                onClick={onUpgrade}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                <Crown className="w-5 h-5 inline mr-2" />
                Upgrade to Pro
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            setAudioProgress((audio.currentTime / audio.duration) * 100);
          }}
          onLoadedMetadata={(e) => {
            const audio = e.currentTarget;
            setAudioDuration(audio.duration);
          }}
          onEnded={() => {
            setIsPlaying(false);
            if (isAutoPlaying && currentPanel < panels.length - 1) {
              setCurrentPanel((prev) => prev + 1);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
};

export default ComicOutput;
