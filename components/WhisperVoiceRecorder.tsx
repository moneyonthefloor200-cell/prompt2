'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, Sparkles, Wand2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WhisperVoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export function WhisperVoiceRecorder({ onTranscript }: WhisperVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start visualizing audio levels
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255); // Normalize to 0-1
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      // Check for supported mimeType
      let mimeType = 'audio/webm;codecs=opus';
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg',
        ''
      ];
      
      for (const type of mimeTypes) {
        if (type === '' || MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType } : undefined
      );
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      setIsRecording(true);
      setStatus('recording');
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setStatus('error');
      setErrorMessage('לא ניתן לגשת למיקרופון. אנא בדוק את ההרשאות.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('processing');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setStatus('processing');
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success && data.text) {
        onTranscript(data.text);
        setStatus('success');
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus('idle');
          setRecordingTime(0);
        }, 2000);
      } else {
        throw new Error(data.error || 'Transcription failed');
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'שגיאה בתמלול. נסה שוב.');
      
      setTimeout(() => {
        setStatus('idle');
        setRecordingTime(0);
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Recording Button */}
      <motion.div
        whileHover={{ scale: status === 'idle' || status === 'recording' ? 1.02 : 1 }}
        whileTap={{ scale: status === 'idle' || status === 'recording' ? 0.98 : 1 }}
      >
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          size="default"
          className={`
            w-full font-medium text-sm h-11 relative overflow-hidden
            ${status === 'recording'
              ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 shadow-sm'
              : status === 'processing'
              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 shadow-sm cursor-not-allowed'
              : status === 'success'
              ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50 shadow-sm cursor-default'
              : status === 'error'
              ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 shadow-sm'
              : 'bg-white/80 hover:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow'
            }
            transition-all duration-200 backdrop-blur-sm
          `}
        >
          
          <div className="relative z-10 flex items-center justify-center gap-2.5">
            {status === 'processing' ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-4 h-4" />
                </motion.div>
                <span className="text-sm">מתמלל...</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">הושלם</span>
              </>
            ) : status === 'error' ? (
              <>
                <XCircle className="w-4 h-4" />
                <span className="text-sm">נסה שוב</span>
              </>
            ) : isRecording ? (
              <>
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-sm font-medium">מקליט</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{formatTime(recordingTime)}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="text-sm">הקלטה קולית</span>
              </>
            )}
          </div>
        </Button>
      </motion.div>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-xl">
              <CardContent className="p-4">
                {/* Audio Visualizer */}
                <div className="relative h-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center gap-1 px-3">
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-slate-900 dark:bg-slate-100 rounded-full opacity-80"
                        animate={{
                          height: `${Math.max(12, audioLevel * 80 * (1 + Math.sin(i * 0.4 + recordingTime) * 0.4))}%`,
                        }}
                        transition={{
                          duration: 0.15,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recording Info */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    דבר בבירור למיקרופון
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <Card className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      מתמלל עם Whisper
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-slate-900 dark:bg-slate-100"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {status === 'error' && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <Card className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {errorMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      {status === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                מופעל על ידי Whisper AI • דיוק 95%+ • זיהוי אוטומטי
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
