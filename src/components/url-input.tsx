'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Link2, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UrlInputProps {
  onUrlChange: (url: string, isValid: boolean) => void;
  disabled?: boolean;
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function UrlInput({ onUrlChange, disabled }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [isValidating, setIsValidating] = useState(false);

  const validateUrl = useCallback(async (value: string) => {
    if (!value.trim()) {
      setValidationState('idle');
      onUrlChange('', false);
      return;
    }

    let normalizedUrl = value.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setIsValidating(true);
    const isValid = isValidUrl(normalizedUrl);
    
    // Simulate a small delay for validation feel
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setValidationState(isValid ? 'valid' : 'invalid');
    setIsValidating(false);
    setUrl(normalizedUrl);
    onUrlChange(normalizedUrl, isValid);
  }, [onUrlChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateUrl(url);
    }
  }, [url, validateUrl]);

  return (
    <Card className={cn(
      'transition-all duration-300',
      validationState === 'valid' && 'ring-2 ring-green-500/50',
      validationState === 'invalid' && 'ring-2 ring-destructive/50',
      disabled && 'opacity-50'
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Landing Page URL</h3>
            <p className="text-xs text-muted-foreground">Enter the page you want to personalize</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </div>
            <Input
              type="url"
              placeholder="https://example.com/landing-page"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationState !== 'idle') {
                  validateUrl(e.target.value);
                }
              }}
              onBlur={() => validateUrl(url)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={cn(
                'pl-10 pr-10 h-11 rounded-lg transition-all duration-200',
                'focus-visible:ring-primary/30 focus-visible:ring-offset-0',
                validationState === 'valid' && 'border-green-500/50 focus-visible:ring-green-500/30',
                validationState === 'invalid' && 'border-destructive/50 focus-visible:ring-destructive/30'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationState === 'valid' && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {validationState === 'invalid' && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>

          {validationState === 'invalid' && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid URL (e.g., https://example.com)
            </p>
          )}

          {validationState === 'valid' && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Valid URL — ready to analyze</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-1">
            {['https://stripe.com', 'https://notion.so', 'https://vercel.com'].map((example) => (
              <Button
                key={example}
                variant="ghost"
                size="sm"
                className="text-[11px] h-7 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => validateUrl(example)}
                disabled={disabled}
              >
                {example.replace('https://', '')}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
