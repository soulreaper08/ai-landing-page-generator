'use client';

import { useCallback, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadZoneProps {
  onImageSelect: (file: File | null, previewUrl: string | null) => void;
  previewUrl: string | null;
  disabled?: boolean;
}

export function ImageUploadZone({ onImageSelect, previewUrl, disabled }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onImageSelect(file, url);
      }
    }
  }, [disabled, onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onImageSelect(file, url);
      }
    }
  }, [onImageSelect]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageSelect]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (disabled) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          onImageSelect(file, url);
          break;
        }
      }
    }
  }, [disabled, onImageSelect]);

  return (
    <Card
      className={cn(
        'relative transition-all duration-300 cursor-pointer group',
        isDragging && 'ring-2 ring-primary scale-[1.02]',
        previewUrl ? 'overflow-hidden' : 'hover:shadow-lg',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onClick={() => !disabled && !previewUrl && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
        disabled={disabled}
      />
      <CardContent className="p-0">
        {previewUrl ? (
          <div className="relative aspect-[4/3] bg-muted/30">
            <img
              src={previewUrl}
              alt="Ad creative preview"
              className="w-full h-full object-contain p-2"
            />
            {!disabled && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <FileImage className="h-3.5 w-3.5" />
                Ad Creative
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[280px]">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
              isDragging
                ? 'bg-primary text-primary-foreground scale-110'
                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
            )}>
              {isDragging ? (
                <Upload className="h-8 w-8 animate-bounce" />
              ) : (
                <ImagePlus className="h-8 w-8" />
              )}
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm font-semibold text-foreground">
                {isDragging ? 'Drop your image here' : 'Upload Ad Creative'}
              </p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Drag & drop an image, or click to browse. Supports PNG, JPG, WebP.
              </p>
              <p className="text-[11px] text-muted-foreground/60">
                You can also paste from clipboard
              </p>
            </div>
            {!isDragging && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-full px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={disabled}
              >
                <ImagePlus className="h-3.5 w-3.5 mr-1.5" />
                Choose File
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
