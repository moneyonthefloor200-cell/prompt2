'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  History, 
  FileText, 
  Settings, 
  Moon, 
  Sun, 
  Keyboard,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavigationBarProps {
  onNavigate: (section: string) => void;
  currentSection: string;
  historyCount?: number;
  templatesCount?: number;
}

export function NavigationBar({ 
  onNavigate, 
  currentSection,
  historyCount = 0,
  templatesCount = 0
}: NavigationBarProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { 
      id: 'home', 
      label: 'בית', 
      icon: Sparkles,
      color: 'text-violet-600 dark:text-violet-400'
    },
    { 
      id: 'history', 
      label: 'היסטוריה', 
      icon: History,
      badge: historyCount,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      id: 'templates', 
      label: 'תבניות', 
      icon: FileText,
      badge: templatesCount,
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      id: 'shortcuts', 
      label: 'קיצורים', 
      icon: Keyboard,
      color: 'text-indigo-600 dark:text-indigo-400'
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="p-2 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Prompt Enhancer
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">v3.0</p>
              </div>
            </motion.div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={currentSection === item.id ? 'default' : 'ghost'}
                    onClick={() => onNavigate(item.id)}
                    className={`relative ${
                      currentSection === item.id
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ml-2 ${currentSection === item.id ? 'text-white' : item.color}`} />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="mr-2 h-5 min-w-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full"
                >
                  <AnimatePresence mode="wait">
                    {isDark ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun className="w-5 h-5 text-amber-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon className="w-5 h-5 text-indigo-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={currentSection === item.id ? 'default' : 'ghost'}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start ${
                      currentSection === item.id
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                        : ''
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ml-2 ${currentSection === item.id ? 'text-white' : item.color}`} />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="mr-auto h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}
