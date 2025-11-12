'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface CustomTemplate {
  id: number;
  name: string;
  content: string;
  category: string;
  createdAt: string;
}

interface CustomTemplatesPanelProps {
  onSelect: (template: CustomTemplate) => void;
}

export function CustomTemplatesPanel({ onSelect }: CustomTemplatesPanelProps) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem('customTemplates');
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const saveTemplates = (updatedTemplates: CustomTemplate[]) => {
    localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleAddTemplate = () => {
    if (!newName.trim() || !newContent.trim()) {
      alert('נא למלא שם ותוכן לתבנית');
      return;
    }

    const newTemplate: CustomTemplate = {
      id: Date.now(),
      name: newName.trim(),
      content: newContent.trim(),
      category: newCategory.trim() || 'כללי',
      createdAt: new Date().toISOString(),
    };

    const updated = [newTemplate, ...templates];
    saveTemplates(updated);
    
    // Reset form
    setNewName('');
    setNewContent('');
    setNewCategory('');
    setIsEditing(false);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate || !newName.trim() || !newContent.trim()) {
      alert('נא למלא שם ותוכן לתבנית');
      return;
    }

    const updated = templates.map(t => 
      t.id === editingTemplate.id
        ? { ...t, name: newName.trim(), content: newContent.trim(), category: newCategory.trim() || 'כללי' }
        : t
    );
    
    saveTemplates(updated);
    setIsEditing(false);
    setEditingTemplate(null);
    setNewName('');
    setNewContent('');
    setNewCategory('');
  };

  const handleEditTemplate = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setNewName(template.name);
    setNewContent(template.content);
    setNewCategory(template.category);
    setIsEditing(true);
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm('האם אתה בטוח שברצונך למחוק תבנית זו?')) {
      const updated = templates.filter(t => t.id !== id);
      saveTemplates(updated);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
    setNewName('');
    setNewContent('');
    setNewCategory('');
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-24 right-6 shadow-lg"
        size="lg"
      >
        <FileText className="w-5 h-5 mr-2" />
        התבניות שלי ({templates.length})
      </Button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-50">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>התבניות שלי</CardTitle>
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
          {templates.length} תבניות מותאמות אישית
        </CardDescription>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Add/Edit Form */}
        {isEditing ? (
          <Card className="border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {editingTemplate ? 'ערוך תבנית' : 'תבנית חדשה'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">שם התבנית</label>
                <Input
                  placeholder="לדוגמה: תבנית לכתיבת בלוג"
                  value={newName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">קטגוריה</label>
                <Input
                  placeholder="לדוגמה: כתיבה, קוד, עסקי"
                  value={newCategory}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">תוכן התבנית</label>
                <Textarea
                  placeholder="הכנס את תוכן התבנית..."
                  value={newContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
                  className="min-h-[120px]"
                  dir="auto"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingTemplate ? handleUpdateTemplate : handleAddTemplate}
                  className="flex-1"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {editingTemplate ? 'עדכן' : 'שמור'}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  ביטול
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            הוסף תבנית חדשה
          </Button>
        )}

        {/* Templates List */}
        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>אין תבניות עדיין</p>
            <p className="text-sm mt-1">צור תבנית ראשונה</p>
          </div>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-indigo-200 dark:hover:border-indigo-800"
              onClick={() => {
                onSelect(template);
                setIsOpen(false);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {formatDate(template.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2" dir="auto">
                  {template.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
