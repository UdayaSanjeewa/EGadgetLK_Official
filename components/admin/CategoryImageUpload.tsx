'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface CategoryImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export function CategoryImageUpload({ imageUrl, onImageChange }: CategoryImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('category-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const uploadedUrl = await uploadImage(file);

    if (uploadedUrl) {
      onImageChange(uploadedUrl);
    } else {
      alert('Failed to upload image');
    }

    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = () => {
    onImageChange('');
  };

  return (
    <div className="space-y-4">
      <Label>Category Image</Label>

      {imageUrl && imageUrl.trim() !== '' ? (
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden border w-full max-w-md">
            <Image
              src={imageUrl}
              alt="Category image"
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg';
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-2"
            onClick={removeImage}
          >
            <X className="w-4 h-4 mr-2" />
            Remove Image
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-700">
                {dragActive ? 'Drop image here' : 'Drag and drop category image here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">or</p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Select Image'}
            </Button>

            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB • Recommended: 1200x600px
            </p>
          </div>
        </div>
      )}

      <div className="pt-2">
        <Label htmlFor="manual-url" className="text-sm text-gray-600">
          Or paste image URL
        </Label>
        <input
          id="manual-url"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => onImageChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
