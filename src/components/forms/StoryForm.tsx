'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Palette, Sparkle, Wand2, ArrowRight, Mic } from 'lucide-react';

interface StoryFormData {
  storyIdea: string;
  characterName: string;
  artStyle: string;
  mood: string;
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
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleInputChange = (field: keyof StoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateStory = async () => {
    if (!canGenerate() || !formData.storyIdea) return;

    setIsGenerating(true);
    try {
      // TODO: Replace with actual API call
      const mockStory = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            title: `${formData.characterName || 'Hero'}'s Comic Adventure`,
            panels: [
              { id: 1, image: '', text: `Meet ${formData.characterName || 'our hero'}, ready for an epic adventure!` },
              { id: 2, image: '', text: `In a world of ${formData.storyIdea}, anything is possible.` },
              { id: 3, image: '', text: `With courage and determination, they face the challenge.` },
              { id: 4, image: '', text: `Victory! The day is saved and lessons are learned.` },
            ],
            style: formData.artStyle,
            mood: formData.mood,
          });
        }, 3000);
      });
      onStoryGenerated(mockStory);
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement speech recognition
  };

  const artStyles = [
    { id: 'comic', label: 'Comic Book', icon: '🦸' },
    { id: 'anime', label: 'Anime', icon: '🌸' },
    { id: 'cartoon', label: 'Cartoon', icon: '🎭' },
    { id: 'realistic', label: 'Realistic', icon: '📷' },
  ];

  const moods = [
    { id: 'adventure', label: 'Adventure', icon: '⚔️' },
    { id: 'funny', label: 'Funny', icon: '😄' },
    { id: 'magical', label: 'Magical', icon: '✨' },
    { id: 'heroic', label: 'Heroic', icon: '🛡️' },
  ];

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-cyan-600/10" />

          {/* Header */}
          <div className="relative text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3 mb-6"
            >
              <Wand2 className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">AI Comic Generator</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Bring Your Story to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Life</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Tell us your story idea and watch AI transform it into a stunning comic
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 relative">
            {/* Story Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-8"
            >
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
                    className={`absolute bottom-3 right-3 w-12 h-12 rounded-full p-0 transition-all duration-300 ${
                      isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-purple-600/80 hover:bg-purple-600'
                    }`}
                  >
                    <Mic className="w-5 h-5 text-white mx-auto" />
                  </button>
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
            </motion.div>

            {/* Style Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <label className="text-lg font-semibold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Art Style
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {artStyles.map((style) => (
                    <motion.button
                      key={style.id}
                      onClick={() => handleInputChange('artStyle', style.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.artStyle === style.id
                          ? 'border-purple-400 bg-purple-400/20 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.icon}</div>
                      <div className="font-medium">{style.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-purple-400" />
                  Story Mood
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.id}
                      onClick={() => handleInputChange('mood', mood.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.mood === mood.id
                          ? 'border-pink-400 bg-pink-400/20 text-white'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-2">{mood.icon}</div>
                      <div className="font-medium">{mood.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center relative"
          >
            <button
              onClick={generateStory}
              disabled={isGenerating || !formData.storyIdea}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white text-xl font-bold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <span className="relative flex items-center space-x-3 justify-center">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    <span>Creating Your Comic...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    <span>Generate Comic</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-3"
              >
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-purple-400' : i === 1 ? 'bg-pink-400' : 'bg-cyan-400'}`}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm">AI is crafting your story panels with consistent characters...</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StoryForm;
