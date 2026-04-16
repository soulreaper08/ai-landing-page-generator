'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, Code2, FileCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CodeViewerProps {
  reactCode?: string;
  htmlCode?: string;
}

export function CodeViewer({ reactCode, htmlCode }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const activeCode = reactCode || htmlCode || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              View Source Code
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(activeCode)}
              className="text-xs gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue={reactCode ? 'react' : 'html'} className="w-full">
            <div className="px-4 border-b border-border/40">
              <TabsList className="bg-transparent h-auto p-0 gap-4">
                {reactCode && (
                  <TabsTrigger
                    value="react"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2.5 pt-2 px-0"
                  >
                    <FileCode className="h-3 w-3 mr-1.5" />
                    React/JSX
                  </TabsTrigger>
                )}
                {htmlCode && (
                  <TabsTrigger
                    value="html"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs pb-2.5 pt-2 px-0"
                  >
                    <Code2 className="h-3 w-3 mr-1.5" />
                    HTML/CSS
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="max-h-96 overflow-auto">
              {reactCode && (
                <TabsContent value="react" className="mt-0 p-0">
                  <SyntaxHighlighter
                    language="tsx"
                    style={oneDark}
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: '0.75rem',
                      lineHeight: '1.6',
                    }}
                    lineNumberStyle={{
                      minWidth: '3em',
                      paddingRight: '1em',
                      color: '#4a5568',
                      userSelect: 'none',
                    }}
                  >
                    {reactCode}
                  </SyntaxHighlighter>
                </TabsContent>
              )}
              {htmlCode && (
                <TabsContent value="html" className="mt-0 p-0">
                  <SyntaxHighlighter
                    language="html"
                    style={oneDark}
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: '0.75rem',
                      lineHeight: '1.6',
                    }}
                    lineNumberStyle={{
                      minWidth: '3em',
                      paddingRight: '1em',
                      color: '#4a5568',
                      userSelect: 'none',
                    }}
                  >
                    {htmlCode}
                  </SyntaxHighlighter>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
