'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  User,
  Palette,
  Sparkles,
  Wand2,
  ArrowRight,
  Mic,
  Shield,
  Cherry,
  Camera,
  Sword,
  Smile,
  Award,
  VolumeX,
  Film,
  Plus,
  Minus,
  Volume2,
  Save,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface StoryFormData {
  storyIdea: string;
  characterName: string;
  artStyle: string;
  mood: string;
  panels: number;
  characterTraits: string[];
  generateNarration: boolean;
  voiceType: 'narrative' | 'character' | 'dramatic' | 'casual';
}

interface StoryFormProps {
  onStoryGenerated: (story: any) => void;
  canGenerate: () => boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ onStoryGenerated, canGenerate }) => {
  const [formData, setFormData] = useState<StoryFormData>({
    storyIdea: '',
    characterName: '',
    artStyle: 'comic',
    mood: 'adventure',
    panels: 4,
    characterTraits: [],
    generateNarration: false,
    voiceType: 'narrative',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);
  const [savedStories, setSavedStories] = useState<StoryFormData[]>([]);
  const recognitionRef = useRef<any>(null);

  // Load saved stories from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedStoryIdeas');
    if (saved) {
      try {
        setSavedStories(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved stories:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof StoryFormData, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateStory = async () => {
    if (!canGenerate() || !formData.storyIdea.trim()) {
      toast.error('Please enter a story idea first!');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Creating your comic story...');

    try {
      const response = await axios.post(
        '/api/generate-comic',
        {
          storyIdea: formData.storyIdea,
          characterName: formData.characterName || 'Hero',
          artStyle: formData.artStyle,
          mood: formData.mood,
          panels: formData.panels,
          characterTraits: formData.characterTraits,
        },
        {
          timeout: 120000, // 2 minutes for complex stories
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;

      if (result.success) {
        toast.dismiss(loadingToast);

        // Generate narration if requested
        if (formData.generateNarration) {
          try {
            const narrationPromises = result.comic.panels.map((panel: any) =>
              axios.post('/api/generate-narration', {
                text: `${panel.narration} ${panel.dialogue.join(' ')}`,
                voiceType: formData.voiceType,
              })
            );

            const narrationResults = await Promise.all(narrationPromises);
            // toast.loading('Adding voice narration...');

            // Add audio to panels
            result.comic.panels = result.comic.panels.map((panel: any, index: number) => ({
              ...panel,
              audioUrl: narrationResults[index]?.data?.audioUrl,
              audioDuration: narrationResults[index]?.data?.duration,
            }));
          } catch (narrationError) {
            console.warn('Narration failed, continuing without audio:', narrationError);
            toast.error('Comic generated successfully, but narration failed');
          }
        }

        onStoryGenerated(result);
        toast.success(`Comic generated with ${result.comic.panels.length} panels in ${result.generationTime}ms!`);

        // Save successful story
        saveStoryIdea();
      } else {
        throw new Error(result.error || 'Failed to generate comic');
      }
    } catch (error: any) {
      console.error('Error generating story:', error);
      toast.dismiss(loadingToast);
      const message = error.response?.data?.error || error.message || 'Failed to generate comic';
      toast.error(`Generation failed: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          toast.error('Voice recognition not supported in this browser');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
          toast.success('Voice recording started! Speak your story idea...');
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');

          setFormData((prev) => ({ ...prev, storyIdea: transcript }));
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event);
          toast.error('Voice recognition failed');
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
          toast.success('Voice recording stopped');
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (error) {
        toast.error('Voice recognition not available');
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  const saveStoryIdea = () => {
    const newStory = { ...formData };
    const updated = [newStory, ...savedStories.slice(0, 9)]; // Keep last 10
    setSavedStories(updated);
    localStorage.setItem('savedStoryIdeas', JSON.stringify(updated));
    toast.success('Story idea saved!');
  };

  const loadStoryIdea = (story: StoryFormData) => {
    setFormData(story);
    toast.success('Story idea loaded!');
  };

  const resetForm = () => {
    setFormData({
      storyIdea: '',
      characterName: '',
      artStyle: 'comic',
      mood: 'adventure',
      panels: 4,
      characterTraits: [],
      generateNarration: false,
      voiceType: 'narrative',
    });
    toast.success('Form reset!');
  };

  const addCharacterTrait = (trait: string) => {
    if (trait && !formData.characterTraits.includes(trait)) {
      handleInputChange('characterTraits', [...formData.characterTraits, trait]);
    }
  };

  const removeCharacterTrait = (trait: string) => {
    handleInputChange(
      'characterTraits',
      formData.characterTraits.filter((t) => t !== trait)
    );
  };

  const storyIdeas = [
    'A time-traveling chef discovers recipes from the future',
    'A shy librarian gains superpowers from magical books',
    "Twin siblings swap bodies and must live each other's lives",
    'A robot learns emotions by working in a flower shop',
    'An astronaut befriends aliens who communicate through colors',
  ];

  const artStyles = [
    { id: 'comic', label: 'Comic Book', icon: Shield, desc: 'Bold lines, vibrant colors' },
    { id: 'anime', label: 'Anime', icon: Cherry, desc: 'Expressive eyes, dynamic poses' },
    { id: 'cartoon', label: 'Cartoon', icon: Smile, desc: 'Playful, exaggerated features' },
    { id: 'realistic', label: 'Realistic', icon: Camera, desc: 'Life-like, detailed artwork' },
  ];

  const moods = [
    { id: 'adventure', label: 'Adventure', icon: Sword, color: 'text-orange-400' },
    { id: 'funny', label: 'Funny', icon: Smile, color: 'text-yellow-400' },
    { id: 'magical', label: 'Magical', icon: Sparkles, color: 'text-purple-400' },
    { id: 'heroic', label: 'Heroic', icon: Award, color: 'text-blue-400' },
  ];

  const voiceTypes = [
    { id: 'narrative', label: 'Narrator', desc: 'Professional storytelling voice' },
    { id: 'character', label: 'Character', desc: 'Expressive character voice' },
    { id: 'dramatic', label: 'Dramatic', desc: 'Intense storytelling voice' },
    { id: 'casual', label: 'Casual', desc: 'Friendly conversational voice' },
  ];

  const commonTraits = ['brave', 'funny', 'smart', 'kind', 'mysterious', 'strong', 'creative', 'loyal'];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pb-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 text-foreground border border-border rounded-3xl shadow-lg overflow-hidden p-6 sm:p-8"
        >
          {/* Header */}
          <div className="relative text-center mb-10 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6"
            >
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium">AI Comic Generator</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4"
            >
              Bring Your Story to{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Life</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Tell us your story idea and watch AI transform it into a stunning comic
              {` `}with voice narration
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Story Idea */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Story Idea *
                </label>
                <div className="relative">
                  <textarea
                    placeholder="A brave banana astronaut explores the mysteries of space..."
                    value={formData.storyIdea}
                    onChange={(e) => handleInputChange('storyIdea', e.target.value)}
                    className="w-full min-h-[120px] text-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-2xl p-4 focus:bg-white/10 focus:border-purple-400/50 transition-all resize-none focus:outline-none"
                    rows={5}
                  />
                  <button
                    onClick={toggleRecording}
                    className={`absolute bottom-3 right-3 w-12 h-12 rounded-full p-0 transition-all duration-300 flex items-center justify-center ${
                      isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-purple-600/80 hover:bg-purple-600'
                    }`}
                  >
                    {isRecording ? <VolumeX className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                  </button>
                </div>

                {/* Story Idea Suggestions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Need inspiration? Try these ideas:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {storyIdeas.map((idea, index) => (
                      <button
                        key={index}
                        onClick={() => handleInputChange('storyIdea', idea)}
                        className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30 text-gray-300 hover:text-white px-3 py-2 rounded-full transition-all"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-400 text-sm"
                  >
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span>Listening... Speak your story idea</span>
                  </motion.div>
                )}
              </div>

              {/* Character Name and Traits */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Main Character Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Captain Banana, Princess Luna..."
                    value={formData.characterName}
                    onChange={(e) => handleInputChange('characterName', e.target.value)}
                    className="w-full text-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-2xl py-4 px-6 focus:bg-white/10 focus:border-purple-400/50 transition-all focus:outline-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Character Traits
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.characterTraits.map((trait) => (
                      <span
                        key={trait}
                        className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 cursor-pointer hover:bg-purple-600/30"
                        onClick={() => removeCharacterTrait(trait)}
                      >
                        {trait}
                        <span className="text-xs opacity-60">×</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonTraits
                      .filter((trait) => !formData.characterTraits.includes(trait))
                      .map((trait) => (
                        <button
                          key={trait}
                          onClick={() => addCharacterTrait(trait)}
                          className="text-xs bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-400/30 text-gray-300 hover:text-purple-300 px-2 py-1 rounded-full transition-all"
                        >
                          + {trait}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Panel Count */}
              <div className="space-y-3 sm:space-y-4">
                {/* Label */}
                <label className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                  <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Number of Panels
                </label>

                {/* Control Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {/* Minus Button */}
                  <button
                    onClick={() => handleInputChange('panels', Math.max(2, formData.panels - 1))}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-card hover:bg-accent/10 border border-border rounded-full flex items-center justify-center text-foreground transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  {/* Value Display */}
                  <div className="bg-card border border-border rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 min-w-[80px] sm:min-w-[100px] text-center">
                    <span className="text-xl sm:text-2xl font-bold text-foreground">{formData.panels}</span>
                    <div className="text-xs text-muted-foreground">panels</div>
                  </div>

                  {/* Plus Button */}
                  <button
                    onClick={() => handleInputChange('panels', Math.min(12, formData.panels + 1))}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-card hover:bg-accent/10 border border-border rounded-full flex items-center justify-center text-foreground transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Hint */}
                  <span className="text-xs sm:text-sm text-muted-foreground">2–12 panels recommended</span>
                </div>
              </div>
            </motion.div>

            {/* Style & Voice Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-8"
            >
              {/* Art Style */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Art Style
                </label>
                <div className="space-y-3">
                  {artStyles.map((style) => (
                    <motion.button
                      key={style.id}
                      onClick={() => handleInputChange('artStyle', style.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 text-left ${
                        formData.artStyle === style.id
                          ? 'border-purple-400 bg-purple-400/20 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <style.icon className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs opacity-70">{style.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Story Mood */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Story Mood
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.id}
                      onClick={() => handleInputChange('mood', mood.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                        formData.mood === mood.id
                          ? 'border-pink-400 bg-pink-400/20 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <mood.icon className={`w-6 h-6 ${mood.color}`} />
                      <div className="font-medium text-sm">{mood.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Voice Narration */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-400" />
                  Voice Narration
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.generateNarration}
                      onChange={(e) => handleInputChange('generateNarration', e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <span className="text-white">Add voice narration</span>
                  </label>

                  {formData.generateNarration && (
                    <div className="space-y-2">
                      {voiceTypes.map((voice) => (
                        <label key={voice.id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="voiceType"
                            value={voice.id}
                            checked={formData.voiceType === voice.id}
                            onChange={(e) => handleInputChange('voiceType', e.target.value as any)}
                            className="w-4 h-4 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                          />
                          <div>
                            <div className="text-sm text-white">{voice.label}</div>
                            <div className="text-xs text-gray-400">{voice.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={saveStoryIdea}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 text-white py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 text-white py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                {/* Saved Stories */}
                {savedStories.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Recent Stories:</div>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {savedStories.slice(0, 3).map((story, index) => (
                        <button
                          key={index}
                          onClick={() => loadStoryIdea(story)}
                          className="w-full text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 p-2 rounded-lg transition-all truncate"
                        >
                          {story.storyIdea.substring(0, 50)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 sm:mt-12 text-center relative"
          >
            {/* Generate Button */}
            <button
              onClick={generateStory}
              disabled={isGenerating || !formData.storyIdea.trim()}
              className="relative group overflow-hidden 
               bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 
               hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700
               text-white font-bold text-lg sm:text-xl 
               px-8 sm:px-12 py-4 sm:py-6 
               rounded-2xl shadow-xl hover:shadow-purple-500/40
               transform hover:scale-105 transition-all duration-300
               disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />

              {/* Button Content */}
              <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white" />
                    <span className="text-sm sm:text-base">Creating your {formData.panels}-panel comic...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>
                      Generate {formData.panels}-Panel Comic
                      {formData.generateNarration ? ' + Audio' : ''}
                    </span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Loader text + bouncing dots */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 sm:mt-6 space-y-2 sm:space-y-3"
              >
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === 0 ? 'bg-purple-400' : i === 1 ? 'bg-pink-400' : 'bg-cyan-400'
                      }`}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  AI is crafting your {formData.panels}-panel story with consistent characters
                  {formData.generateNarration && ' and voice narration'}...
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StoryForm;
