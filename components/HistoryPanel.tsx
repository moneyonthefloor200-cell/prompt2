'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, Clock, ArrowRight, Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';

interface HistoryEntry {
  id: number;
  original: string;
  enhanced: string;
  explanation: string;
  timestamp: string;
}

interface HistoryPanelProps {
  onSelect: (entry: HistoryEntry) => void;
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('promptHistory');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const clearHistory = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?')) {
      localStorage.removeItem('promptHistory');
      setHistory([]);
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['תאריך', 'פרומפט מקורי', 'פרומפט משופר', 'הסבר'];
    const rows = history.map(entry => [
      new Date(entry.timestamp).toLocaleString('he-IL'),
      `"${entry.original.replace(/"/g, '""')}"`,
      `"${entry.enhanced.replace(/"/g, '""')}"`,
      `"${entry.explanation.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Add BOM for Hebrew support
    const BOM = '\uFEFF';
    const dataBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported) && imported.length > 0) {
            // Merge with existing history, avoiding duplicates
            const existingIds = new Set(history.map(h => h.id));
            const newEntries = imported.filter((entry: HistoryEntry) => !existingIds.has(entry.id));
            const merged = [...newEntries, ...history].slice(0, 50); // Keep max 50
            localStorage.setItem('promptHistory', JSON.stringify(merged));
            setHistory(merged);
            alert(`יובאו ${newEntries.length} פרומפטים בהצלחה!`);
          } else {
            alert('הקובץ לא תקין');
          }
        } catch (error) {
          alert('שגיאה בקריאת הקובץ');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const deleteEntry = (id: number) => {
    const updated = history.filter(entry => entry.id !== id);
    localStorage.setItem('promptHistory', JSON.stringify(updated));
    setHistory(updated);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'עכשיו';
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-6 right-6 shadow-lg"
        size="lg"
      >
        <History className="w-5 h-5 mr-2" />
        היסטוריה ({history.length})
      </Button>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-50">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>היסטוריה</CardTitle>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </div>
        <CardDescription>
          {history.length} פרומפטים אחרונים
        </CardDescription>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>אין היסטוריה עדיין</p>
            <p className="text-sm mt-1">פרומפטים משופרים יופיעו כאן</p>
          </div>
        ) : (
          history.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-indigo-200 dark:hover:border-indigo-800"
              onClick={() => {
                onSelect(entry);
                setIsOpen(false);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(entry.timestamp)}
                  </Badge>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      מקורי:
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300" dir="auto">
                      {truncate(entry.original, 80)}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-indigo-400 mx-auto" />

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      משופר:
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2" dir="auto">
                      {truncate(entry.enhanced, 100)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={exportToJSON}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:bg-blue-50"
            >
              <FileJson className="w-4 h-4 mr-1" />
              JSON
            </Button>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="text-green-600 hover:bg-green-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              CSV
            </Button>
          </div>
          <Button
            onClick={importFromJSON}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            ייבא מקובץ JSON
          </Button>
          <Button
            onClick={clearHistory}
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            מחק הכל
          </Button>
        </div>
      )}
    </div>
  );
}
