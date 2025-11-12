'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Check, Loader2, ArrowRight, FileText } from 'lucide-react';
import { HistoryPanel } from '@/components/HistoryPanel';
import { CustomTemplatesPanel } from '@/components/CustomTemplatesPanel';
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
      localStorage.setItem('promptHistory', JSON.stringify(history.slice(0, 10)));
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <HistoryPanel onSelect={handleHistorySelect} />
      <CustomTemplatesPanel onSelect={handleCustomTemplateSelect} />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
              Prompt Enhancer
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            שנה כל פרומפט לפרומפט מקצועי ומדויק באמצעות טכניקות Prompt Engineering מתקדמות
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Badge variant="secondary">CRISPE Framework</Badge>
            <Badge variant="secondary">Chain-of-Thought</Badge>
            <Badge variant="secondary">RISEN Method</Badge>
            <Badge variant="secondary">Few-Shot Learning</Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>הפרומפט המקורי שלך</span>
                  </CardTitle>
                  <CardDescription>
                    הכנס את הפרומפט או המשפט שברצונך לשפר
                  </CardDescription>
                </div>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="w-[200px]">
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
                  className="min-h-[300px] text-base resize-none"
                  dir="auto"
                />
                {originalPrompt && (
                  <div className="absolute bottom-2 left-2 text-xs text-slate-500 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded">
                    {originalPrompt.length} תווים
                  </div>
                )}
              </div>
              
              {progress && (
                <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progress}</span>
                </div>
              )}
              
              <Button
                onClick={handleEnhance}
                disabled={loading || !originalPrompt.trim()}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                size="lg"
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
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-lg border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>הפרומפט המשופר</span>
              </CardTitle>
              <CardDescription>
                פרומפט מקצועי עם כל האלמנטים הנדרשים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={enhancedPrompt}
                  readOnly
                  placeholder="הפרומפט המשופר יופיע כאן..."
                  className="min-h-[300px] text-base resize-none bg-slate-50 dark:bg-slate-900"
                  dir="auto"
                />
                {enhancedPrompt && (
                  <>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 left-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          הועתק!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          העתק
                        </>
                      )}
                    </Button>
                    <div className="absolute bottom-2 left-2 text-xs text-slate-500 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded">
                      {enhancedPrompt.length} תווים
                      {originalPrompt && (
                        <span className="text-green-600 dark:text-green-400 mr-1">
                          (×{Math.round(enhancedPrompt.length / originalPrompt.length * 10) / 10})
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {explanation && (
                <Card className="mt-4 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">מה שופר?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap" dir="auto">
                      {explanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-2">
          <CardHeader>
            <CardTitle>איך זה עובד?</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">📝 Context & Role</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                מוסיף הקשר רלוונטי ומגדיר תפקיד מומחה מתאים
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">🎯 Instructions & Specifics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                מבהיר את המשימה ומוסיף פרטים, פורמט ואילוצים
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">💡 Examples & Reasoning</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                מוסיף דוגמאות והוראות לחשיבה שלב-אחר-שלב
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
