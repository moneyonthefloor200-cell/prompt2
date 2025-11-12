'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

export function VoiceRecorder({ onTranscript, isRecording, onRecordingChange }: VoiceRecorderProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('הדפדפן שלך לא תומך בהקלטה קולית. נסה Chrome, Edge או Safari.');
        return;
      }

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      // Try multiple languages for better detection
      recognition.lang = 'he-IL';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            // Add to accumulated transcript
            finalTranscriptRef.current += transcript + ' ';
            onTranscript(finalTranscriptRef.current.trim());
          } else {
            interim += transcript;
          }
        }
        
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            setError('לא זוהה דיבור. נסה שוב.');
            break;
          case 'audio-capture':
            setError('לא נמצא מיקרופון. בדוק את ההגדרות.');
            break;
          case 'not-allowed':
            setError('יש לאשר גישה למיקרופון.');
            break;
          case 'network':
            setError('שגיאת רשת. בדוק את החיבור לאינטרנט.');
            break;
          default:
            setError('שגיאה בהקלטה. נסה שוב.');
        }
        
        onRecordingChange(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isRecording) {
          // Restart if still supposed to be recording
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            onRecordingChange(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      setError(null);
      setInterimTranscript('');
      finalTranscriptRef.current = ''; // Reset on new recording
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.error('Failed to start recognition:', e);
        // Handle "already started" error
        if (e.message && e.message.includes('already started')) {
          console.log('Recognition already running');
        } else {
          setError('לא ניתן להתחיל הקלטה. נסה שוב.');
          onRecordingChange(false);
        }
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recognition:', e);
      }
      setInterimTranscript('');
      finalTranscriptRef.current = '';
    }
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isSupported) return;
    onRecordingChange(!isRecording);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="flex-1"
        >
          <Button
            onClick={toggleRecording}
            disabled={!isSupported}
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            className={`
              w-full font-semibold text-base
              ${isRecording 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl shadow-red-500/40 border-0' 
                : 'bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/50 dark:to-indigo-950/50 hover:from-violet-100 hover:to-indigo-100 dark:hover:from-violet-900/50 dark:hover:to-indigo-900/50 border-2 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300'
              }
              transition-all duration-300 backdrop-blur-sm
            `}
          >
            {isRecording ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mr-2"
                >
                  <MicOff className="w-5 h-5" />
                </motion.div>
                <span className="flex items-center gap-2">
                  עצור הקלטה
                  {isListening && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-xs"
                    >
                      ●
                    </motion.span>
                  )}
                </span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                🎤 הקלט קולית
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="bg-gradient-to-br from-red-50 via-pink-50 to-red-50 dark:from-red-950/40 dark:via-pink-950/40 dark:to-red-950/40 border-2 border-red-300 dark:border-red-700 shadow-lg shadow-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.4, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(239, 68, 68, 0.7)',
                        '0 0 0 10px rgba(239, 68, 68, 0)',
                        '0 0 0 0 rgba(239, 68, 68, 0)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-4 h-4 bg-red-500 rounded-full shadow-lg"
                  />
                  <div className="flex-1">
                    <span className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                      🎙️ מקליט עכשיו...
                    </span>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                      {isListening ? 'מאזין לדיבור' : 'מתחבר...'}
                    </p>
                  </div>
                </div>
                {interimTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium" dir="auto">
                      💬 "{interimTranscript}"
                    </p>
                  </motion.div>
                )}
                {!interimTranscript && isListening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center italic"
                  >
                    מחכה לדיבור...
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">
                      ⚠️ שגיאה בהקלטה
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {error}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browser Support Warning */}
      {!isSupported && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-2 border-slate-300 dark:border-slate-600 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">🚫 הקלטה קולית לא זמינה</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    הדפדפן שלך לא תומך בהקלטה קולית.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    💡 השתמש ב-Chrome, Edge או Safari לתמיכה מלאה.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
