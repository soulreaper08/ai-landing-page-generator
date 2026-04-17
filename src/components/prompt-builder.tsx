'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, FileText, RotateCcw, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PromptBuilderProps {
  prompt: string;
  promptStats?: { characters: number; words: number; estimatedReadingTime: number };
  isAnalyzing: boolean;
  onPromptChange: (prompt: string) => void;
}

export function PromptBuilder({ prompt, promptStats, isAnalyzing, onPromptChange }: PromptBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!prompt && isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Building your AI prompt...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!prompt) return null;

  const handleExpand = () => {
    setEditedPrompt(prompt);
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSave = () => {
    onPromptChange(editedPrompt);
    setIsExpanded(false);
  };

  const handleReset = () => {
    setEditedPrompt(prompt);
  };

  const previewText = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className={cn(
        'border-border/60 transition-all duration-300',
        isExpanded && 'border-primary/30 shadow-lg shadow-primary/5'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              AI Prompt Preview
            </CardTitle>
            {promptStats && !isExpanded && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  {promptStats.characters.toLocaleString()} chars
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  {promptStats.words.toLocaleString()} words
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="rounded-lg bg-muted/50 p-4 mb-3">
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed whitespace-pre-line">
                    {previewText}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    This prompt will be sent to Google Stitch AI
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExpand}
                    className="text-xs gap-1.5 text-primary hover:text-primary"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Expand Full Prompt
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Textarea
                  ref={textareaRef}
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  rows={14}
                  className="font-mono text-xs leading-relaxed resize-none bg-muted/30 border-primary/20 focus:border-primary/50"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-muted-foreground">
                    {editedPrompt.length.toLocaleString()} characters
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="text-xs gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="h-3 w-3" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
