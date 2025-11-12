'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Check, Loader2, ArrowRight, FileText, Zap, Target, Lightbulb, TrendingUp, BarChart3, Layers, GitCompare } from 'lucide-react';
import { HistoryPanel } from '@/components/HistoryPanel';
import { CustomTemplatesPanel } from '@/components/CustomTemplatesPanel';
import { NavigationBar } from '@/components/NavigationBar';
import { KeyboardShortcutsPanel } from '@/components/KeyboardShortcutsPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TEMPLATES = {
  coding: 'עזור לי עם [שפת תכנות/framework]. אני צריך...',
  writing: 'כתוב [סוג תוכן - מאמר/בלוג/מדריך] על [נושא] עבור [קהל יעד]',
  business: 'צור [מסמך עסקי - תוכנית שיווק/מצגת/דוח] ל[מטרה/פרויקט]',
  teaching: 'הסבר [נושא/מושג] ל[קהל יעד - מתחילים/מתקדמים/ילדים]',
  creative: 'כתוב [סיפור/שיר/תסריט] בנושא [נושא] בסגנון [סגנון]',
  analysis: 'נתח את [נושא/נתונים/טקסט] והתמקד ב[היבט ספציפי]',
};

export default function Home() {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState('');
  const [currentSection, setCurrentSection] = useState('home');
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [templatesCount, setTemplatesCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, avgImprovement: 0 });

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
      const templates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      setHistoryCount(history.length);
      setTemplatesCount(templates.length);
      
      // Calculate average improvement
      if (history.length > 0) {
        const improvements = history.map((h: any) => 
          h.enhanced.length / h.original.length
        );
        const avg = improvements.reduce((a: number, b: number) => a + b, 0) / improvements.length;
        setStats({ total: history.length, avgImprovement: Math.round(avg * 10) / 10 });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleEnhance = async () => {
    if (!originalPrompt.trim()) return;
    
    setLoading(true);
    setEnhancedPrompt('');
    setExplanation('');
    setProgress('מנתח את הפרומפט...');
    
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: originalPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) {
        throw new Error('No response body');
      }

      let charCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                alert('Error: ' + data.error);
                setLoading(false);
                setProgress('');
                return;
              }
              
              if (data.done) {
                setEnhancedPrompt(data.enhancedPrompt);
                setExplanation(data.explanation);
                setProgress('הושלם! ✨');
                
                // Save to history
                saveToHistory(originalPrompt, data.enhancedPrompt, data.explanation);
                loadStats(); // Refresh stats
                
                setTimeout(() => setProgress(''), 2000);
              } else if (data.content) {
                setEnhancedPrompt(prev => prev + data.content);
                charCount += data.content.length;
                
                // Update progress based on content length
                if (charCount < 100) {
                  setProgress('מוסיף Context ו-Role...');
                } else if (charCount < 300) {
                  setProgress('מגדיר Instructions...');
                } else if (charCount < 600) {
                  setProgress('מוסיף Specifics ודוגמאות...');
                } else {
                  setProgress('משלים את הפרומפט...');
                }
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      alert('Failed to enhance prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (original: string, enhanced: string, explanation: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
      const newEntry = {
        id: Date.now(),
        original,
        enhanced,
        explanation,
        timestamp: new Date().toISOString(),
      };
      history.unshift(newEntry);
      localStorage.setItem('promptHistory', JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(enhancedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistorySelect = (entry: any) => {
    setOriginalPrompt(entry.original);
    setEnhancedPrompt(entry.enhanced);
    setExplanation(entry.explanation);
    setShowHistory(false);
  };

  const handleClear = () => {
    setOriginalPrompt('');
    setEnhancedPrompt('');
    setExplanation('');
    setProgress('');
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to enhance
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!loading && originalPrompt.trim()) {
        handleEnhance();
      }
    }
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      handleClear();
    }
  };

  const handleTemplateSelect = (value: string) => {
    setOriginalPrompt(TEMPLATES[value as keyof typeof TEMPLATES]);
  };

  const handleCustomTemplateSelect = (template: any) => {
    setOriginalPrompt(template.content);
    setShowTemplates(false);
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    if (section === 'history') {
      setShowHistory(true);
      setShowTemplates(false);
      setShowShortcuts(false);
    } else if (section === 'templates') {
      setShowTemplates(true);
      setShowHistory(false);
      setShowShortcuts(false);
    } else if (section === 'shortcuts') {
      setShowShortcuts(true);
      setShowHistory(false);
      setShowTemplates(false);
    } else {
      setShowHistory(false);
      setShowTemplates(false);
      setShowShortcuts(false);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + /
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Ctrl/Cmd + H
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        handleNavigate('history');
      }
      // Ctrl/Cmd + T
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        handleNavigate('templates');
      }
      // Escape to close panels
      if (e.key === 'Escape') {
        setShowHistory(false);
        setShowTemplates(false);
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50 dark:from-slate-950 dark:via-violet-950/30 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation Bar */}
      <NavigationBar onNavigate={handleNavigate} currentSection={currentSection} />

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && <HistoryPanel onSelect={handleHistorySelect} isOpen={showHistory} />}
      </AnimatePresence>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && <CustomTemplatesPanel onSelect={handleCustomTemplateSelect} isOpen={showTemplates} />}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-7xl lg:mr-72 relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/50"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Prompt Enhancer
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6"
          >
            שנה כל פרומפט לפרומפט מקצועי ומדויק באמצעות טכניקות Prompt Engineering מתקדמות
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {['CRISPE Framework', 'Chain-of-Thought', 'RISEN Method', 'Few-Shot Learning'].map((badge, index) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                  {badge}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-2xl shadow-violet-500/10 border-2 border-white/20 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Zap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      <span>הפרומפט המקורי שלך</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      הכנס את הפרומפט או המשפט שברצונך לשפר
                    </CardDescription>
                  </div>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-[200px] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="תבניות מהירות" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coding">💻 עזרה בקוד</SelectItem>
                      <SelectItem value="writing">✍️ כתיבת תוכן</SelectItem>
                      <SelectItem value="business">💼 עסקי</SelectItem>
                      <SelectItem value="teaching">🎓 הוראה</SelectItem>
                      <SelectItem value="creative">🎨 יצירתי</SelectItem>
                      <SelectItem value="analysis">📊 ניתוח</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    placeholder="לדוגמה: כתוב לי מאמר על AI... (Ctrl+Enter לשליחה, Ctrl+K לניקוי)"
                    value={originalPrompt}
                    onChange={(e) => setOriginalPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[350px] text-base resize-none bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 focus:border-violet-400 dark:focus:border-violet-600 transition-all"
                    dir="auto"
                  />
                  {originalPrompt && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-3 left-3 text-xs text-slate-500 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm"
                    >
                      {originalPrompt.length} תווים
                    </motion.div>
                  )}
                </div>
                
                <AnimatePresence>
                  {progress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800"
                    >
                      <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-medium">{progress}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleEnhance}
                    disabled={loading || !originalPrompt.trim()}
                    className="w-full mt-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30 text-lg h-12"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {enhancedPrompt ? 'מייצר...' : 'משפר...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        שפר פרומפט
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-2xl shadow-indigo-500/10 border-2 border-violet-200 dark:border-violet-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <span>הפרומפט המשופר</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  פרומפט מקצועי עם כל האלמנטים הנדרשים
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={enhancedPrompt}
                    readOnly
                    placeholder="הפרומפט המשופר יופיע כאן..."
                    className="min-h-[350px] text-base resize-none bg-gradient-to-br from-violet-50/50 to-indigo-50/50 dark:from-violet-950/30 dark:to-indigo-950/30 backdrop-blur-sm border-2 border-violet-200 dark:border-violet-800"
                    dir="auto"
                  />
                  {enhancedPrompt && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          size="sm"
                          className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-1 text-green-600" />
                              הועתק!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              העתק
                            </>
                          )}
                        </Button>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 left-3 text-xs text-slate-500 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm"
                      >
                        {enhancedPrompt.length} תווים
                        {originalPrompt && (
                          <span className="text-green-600 dark:text-green-400 mr-2 font-bold">
                            (×{Math.round(enhancedPrompt.length / originalPrompt.length * 10) / 10})
                          </span>
                        )}
                      </motion.div>
                    </>
                  )}
                </div>
                
                <AnimatePresence>
                  {explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="mt-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            מה שופר?
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed" dir="auto">
                            {explanation}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-violet-50/80 to-indigo-50/80 dark:from-violet-950/30 dark:to-indigo-950/30 border-2 border-white/20 dark:border-slate-700/50 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">איך זה עובד?</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '📝',
                  title: 'Context & Role',
                  desc: 'מוסיף הקשר רלוונטי ומגדיר תפקיד מומחה מתאים',
                  color: 'text-violet-600 dark:text-violet-400'
                },
                {
                  icon: '🎯',
                  title: 'Instructions & Specifics',
                  desc: 'מבהיר את המשימה ומוסיף פרטים, פורמט ואילוצים',
                  color: 'text-blue-600 dark:text-blue-400'
                },
                {
                  icon: '💡',
                  title: 'Examples & Reasoning',
                  desc: 'מוסיף דוגמאות והוראות לחשיבה שלב-אחר-שלב',
                  color: 'text-purple-600 dark:text-purple-400'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/50 shadow-lg"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className={`font-semibold mb-2 text-lg ${item.color}`}>{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
