import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../lib/api';

const MAX_IMAGES = 6;

interface ProductImagesFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ProductImagesField({ images, onChange }: ProductImagesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const filledImages = images.filter(Boolean);

  const uploadFile = async (file: File) => {
    if (filledImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post<{ url: string }>('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...filledImages, data.url]);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (filledImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    onChange([...filledImages, url]);
    setUrlDraft('');
  };

  const removeImage = (index: number) => {
    onChange(filledImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {filledImages.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-ink/10 bg-paper">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {filledImages.length < MAX_IMAGES && (
          <button type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/20 bg-white/50 text-xs text-ink/60 hover:border-forest-500 hover:text-forest-600"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
        }}
      />

      <div className="flex gap-2">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="Or paste an image URL"
          className="input"
        />
        <button type="button" onClick={addUrl} className="btn-outline shrink-0">
          <Link2 className="h-4 w-4" /> Add URL
        </button>
      </div>

      <p className="text-xs text-ink/50">
        Upload JPEG, PNG, WebP, or GIF (max 5 MB). Up to {MAX_IMAGES} images per product.
      </p>
    </div>
  );
}
