'use client';

import React, { useMemo, useState } from 'react';
import { Check, Copy, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CodeViewerProps {
  code: string;
  language?: string;
  fileName?: string;
}

/**
 * Very small HTML syntax highlighter.
 *
 * Tokenisation is done via a single regex sweep so that the order
 * of colour classes never overlaps. Each token is rendered as an
 * individual <span> with a Tailwind colour class.
 *
 * Colour mapping (GitHub-dark inspired):
 *  - tags / brackets       → text-blue-400
 *  - attributes            → text-amber-300
 *  - strings               → text-emerald-400
 *  - comments              → text-gray-500 italic
 *  - special chars (&amp;…)→ text-pink-300
 */
function highlightHTML(line: string): React.ReactNode {
  const re =
    /(<!--[\s\S]*?-->)|("[^"]*"|'[^']*')|(&[^;\s]+;)|(<\/?)([\w-]+)|([\w-]+)(?=\s*=)|(<|>|\/)/g;

  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(line)) !== null) {
    // plain text before this token
    if (match.index > lastIndex) {
      tokens.push(
        <span key={`t${lastIndex}`} className="text-gray-300">
          {line.slice(lastIndex, match.index)}
        </span>
      );
    }

    const key = `m${match.index}`;
    const [comment, string, entity, openBracket, tagName, attrName, punct] =
      match;

    if (comment) {
      tokens.push(
        <span key={key} className="text-gray-500 italic">
          {comment}
        </span>
      );
    } else if (string) {
      tokens.push(
        <span key={key} className="text-emerald-400">
          {string}
        </span>
      );
    } else if (entity) {
      tokens.push(
        <span key={key} className="text-pink-300">
          {entity}
        </span>
      );
    } else if (openBracket) {
      tokens.push(
        <span key={`${key}-b`} className="text-blue-400">
          {openBracket}
        </span>
      );
      if (tagName) {
        tokens.push(
          <span key={`${key}-n`} className="text-blue-400 font-semibold">
            {tagName}
          </span>
        );
      }
    } else if (attrName) {
      tokens.push(
        <span key={key} className="text-amber-300">
          {attrName}
        </span>
      );
    } else if (punct) {
      tokens.push(
        <span key={key} className="text-blue-400">
          {punct}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // trailing plain text
  if (lastIndex < line.length) {
    tokens.push(
      <span key={`tail${lastIndex}`} className="text-gray-300">
        {line.slice(lastIndex)}
      </span>
    );
  }

  return tokens.length > 0 ? tokens : null;
}

export function CodeViewer({
  code,
  language,
  fileName,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => code.split('\n'), [code]);
  const lineCount = lines.length;

  const displayFileName = fileName ?? (language ? `code.${language}` : 'code.html');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-[#0d1117] py-0 gap-0">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <FileCode className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-300">{displayFileName}</span>
          <span className="text-xs text-gray-500">({lineCount} lines)</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 text-xs text-gray-400 hover:bg-white/10 hover:text-gray-200"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* ── Code area ── */}
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <pre className="text-[13px] leading-5 font-mono">
            <code>
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex hover:bg-white/[0.03] transition-colors"
                >
                  {/* line number gutter */}
                  <span className="sticky left-0 z-10 inline-block w-12 shrink-0 select-none text-right pr-4 pl-4 text-gray-600 bg-[#0d1117]">
                    {idx + 1}
                  </span>
                  {/* code content */}
                  <span className="flex-1 whitespace-pre-wrap break-all pr-4">
                    {highlightHTML(line)}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
