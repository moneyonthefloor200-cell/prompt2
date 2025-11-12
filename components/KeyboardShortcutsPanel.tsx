'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'כללי',
    items: [
      { keys: ['Ctrl', 'Enter'], description: 'שלח פרומפט לשיפור', mac: ['⌘', 'Enter'] },
      { keys: ['Ctrl', 'K'], description: 'נקה את כל השדות', mac: ['⌘', 'K'] },
      { keys: ['Ctrl', 'H'], description: 'פתח היסטוריה', mac: ['⌘', 'H'] },
      { keys: ['Ctrl', 'T'], description: 'פתח תבניות', mac: ['⌘', 'T'] },
      { keys: ['Ctrl', '/'], description: 'הצג קיצורי מקלדת', mac: ['⌘', '/'] },
    ]
  },
  {
    category: 'עריכה',
    items: [
      { keys: ['Ctrl', 'C'], description: 'העתק פרומפט משופר', mac: ['⌘', 'C'] },
      { keys: ['Ctrl', 'A'], description: 'בחר הכל', mac: ['⌘', 'A'] },
      { keys: ['Esc'], description: 'סגור פאנלים', mac: ['Esc'] },
    ]
  },
  {
    category: 'ניווט',
    items: [
      { keys: ['Tab'], description: 'עבור לשדה הבא', mac: ['Tab'] },
      { keys: ['Shift', 'Tab'], description: 'עבור לשדה הקודם', mac: ['Shift', 'Tab'] },
    ]
  }
];

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-violet-200 dark:border-violet-800 shadow-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg">
                      <Keyboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">קיצורי מקלדת</CardTitle>
                      <CardDescription className="mt-1">
                        עבוד מהר יותר עם קיצורי דרך נוחים
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {shortcuts.map((section, sectionIndex) => (
                    <motion.div
                      key={section.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sectionIndex * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
                        {section.category}
                      </h3>
                      <div className="space-y-2">
                        {section.items.map((shortcut, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {shortcut.description}
                            </span>
                            <div className="flex items-center gap-1">
                              {(isMac ? shortcut.mac : shortcut.keys).map((key, keyIndex) => (
                                <div key={keyIndex} className="flex items-center gap-1">
                                  <Badge
                                    variant="secondary"
                                    className="px-2 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm"
                                  >
                                    {key}
                                  </Badge>
                                  {keyIndex < (isMac ? shortcut.mac : shortcut.keys).length - 1 && (
                                    <span className="text-slate-400 text-xs">+</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pro Tip */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 rounded-lg border border-violet-200 dark:border-violet-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <h4 className="font-semibold text-sm text-violet-900 dark:text-violet-100 mb-1">
                        טיפ מקצועי
                      </h4>
                      <p className="text-xs text-violet-700 dark:text-violet-300">
                        השתמש ב-{isMac ? '⌘' : 'Ctrl'} + / בכל עת כדי לפתוח את רשימת הקיצורים הזו
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
