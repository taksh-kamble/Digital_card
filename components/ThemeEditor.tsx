import { useState, useEffect } from 'react';
import { Upload, X, Palette, Pipette, Maximize2, Info } from 'lucide-react';

interface ThemeEditorProps {
  currentLogo?: string;
  currentPrimaryColor?: string;
  currentSecondaryColor?: string;
  currentLogoWidth?: number;
  currentLogoHeight?: number;
  onSave: (logoUrl: string, primaryColor: string, secondaryColor: string, logoWidth: number, logoHeight: number) => Promise<void>;
}

const colorOptions = [
  { name: 'Orange', value: 'orange', hex: '#f97316' },
  { name: 'Blue', value: 'blue', hex: '#2563eb' },
  { name: 'Purple', value: 'purple', hex: '#9333ea' },
  { name: 'Red', value: 'red', hex: '#dc2626' },
  { name: 'Green', value: 'green', hex: '#16a34a' },
  { name: 'Teal', value: 'teal', hex: '#0d9488' },
  { name: 'Pink', value: 'pink', hex: '#ec4899' },
  { name: 'Indigo', value: 'indigo', hex: '#4f46e5' },
  { name: 'Cyan', value: 'cyan', hex: '#06b6d4' },
  { name: 'Amber', value: 'amber', hex: '#f59e0b' },
  { name: 'Lime', value: 'lime', hex: '#84cc16' },
  { name: 'Emerald', value: 'emerald', hex: '#10b981' },
  { name: 'Sky', value: 'sky', hex: '#0ea5e9' },
  { name: 'Violet', value: 'violet', hex: '#8b5cf6' },
  { name: 'Fuchsia', value: 'fuchsia', hex: '#d946ef' },
  { name: 'Rose', value: 'rose', hex: '#f43f5e' },
];

const MAX_LOGO_HEIGHT = 300;
const MAX_LOGO_WIDTH = 600;
const MIN_LOGO_SIZE = 30;
const FIXED_BANNER_HEIGHT = 128;

export default function ThemeEditor({ 
  currentLogo, 
  currentPrimaryColor = 'orange', 
  currentSecondaryColor = 'green',
  currentLogoWidth = 80,
  currentLogoHeight = 80,
  onSave 
}: ThemeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentLogo || '');
  const [primaryColor, setPrimaryColor] = useState(currentPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(currentSecondaryColor);
  const [logoWidth, setLogoWidth] = useState(currentLogoWidth);
  const [logoHeight, setLogoHeight] = useState(currentLogoHeight);
  const [customPrimaryHex, setCustomPrimaryHex] = useState('');
  const [customSecondaryHex, setCustomSecondaryHex] = useState('');
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(currentLogo || '');
  const [error, setError] = useState('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    setLogoUrl(currentLogo || '');
    setLogoPreview(currentLogo || '');
    setPrimaryColor(currentPrimaryColor);
    setSecondaryColor(currentSecondaryColor);
    setLogoWidth(currentLogoWidth);
    setLogoHeight(currentLogoHeight);
    if (currentLogoWidth && currentLogoHeight) {
      setAspectRatio(currentLogoWidth / currentLogoHeight);
    }
  }, [currentLogo, currentPrimaryColor, currentSecondaryColor, currentLogoWidth, currentLogoHeight]);

  const getDisplayDimensions = (width: number, height: number) => {
    const maxHeight = FIXED_BANNER_HEIGHT - 40;
    const maxWidth = 500;
    
    let displayWidth = width;
    let displayHeight = height;
    
    if (height > maxHeight) {
      const scale = maxHeight / height;
      displayHeight = maxHeight;
      displayWidth = width * scale;
    }
    
    if (displayWidth > maxWidth) {
      const scale = maxWidth / displayWidth;
      displayWidth = maxWidth;
      displayHeight = displayHeight * scale;
    }
    
    return { displayWidth, displayHeight };
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dmhr3fumd';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'my_unsigned_preset';
    
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!res.ok) {
      const errorData = await res.text();
      console.error('Cloudinary upload failed:', errorData);
      throw new Error('Failed to upload image to Cloudinary: ' + errorData);
    }

    const data = await res.json();
    return data.secure_url;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo file size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const naturalAspectRatio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(naturalAspectRatio);

      let initialWidth = 100;
      let initialHeight = 100;

      if (naturalAspectRatio > 1) {
        initialWidth = Math.min(140, MAX_LOGO_WIDTH);
        initialHeight = Math.round(initialWidth / naturalAspectRatio);
      } else {
        initialHeight = Math.min(100, MAX_LOGO_HEIGHT);
        initialWidth = Math.round(initialHeight * naturalAspectRatio);
      }

      setLogoWidth(initialWidth);
      setLogoHeight(initialHeight);
      
      URL.revokeObjectURL(objectUrl);

      const uploadedUrl = await uploadToCloudinary(file);
      setLogoUrl(uploadedUrl);
      setLogoPreview(uploadedUrl);
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleWidthChange = (newWidth: number) => {
    const clampedWidth = Math.max(MIN_LOGO_SIZE, Math.min(MAX_LOGO_WIDTH, newWidth));
    setLogoWidth(clampedWidth);
    
    if (maintainAspectRatio) {
      const newHeight = Math.round(clampedWidth / aspectRatio);
      const clampedHeight = Math.max(MIN_LOGO_SIZE, Math.min(MAX_LOGO_HEIGHT, newHeight));
      setLogoHeight(clampedHeight);
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const clampedHeight = Math.max(MIN_LOGO_SIZE, Math.min(MAX_LOGO_HEIGHT, newHeight));
    setLogoHeight(clampedHeight);
    
    if (maintainAspectRatio) {
      const newWidth = Math.round(clampedHeight * aspectRatio);
      const clampedWidth = Math.max(MIN_LOGO_SIZE, Math.min(MAX_LOGO_WIDTH, newWidth));
      setLogoWidth(clampedWidth);
    }
  };

  const handleCustomPrimaryColor = (hex: string) => {
    setCustomPrimaryHex(hex);
    setPrimaryColor(hex);
  };

  const handleCustomSecondaryColor = (hex: string) => {
    setCustomSecondaryHex(hex);
    setSecondaryColor(hex);
  };

  const isValidHex = (hex: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const handleSave = async () => {
    if (isUploading) {
      setError('Please wait for logo upload to complete');
      return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      await onSave(logoUrl, primaryColor, secondaryColor, logoWidth, logoHeight);
      setIsEditing(false);
      setShowPrimaryPicker(false);
      setShowSecondaryPicker(false);
    } catch (error) {
      console.error('Error saving theme:', error);
      setError('Failed to save theme. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLogoUrl(currentLogo || '');
    setLogoPreview(currentLogo || '');
    setPrimaryColor(currentPrimaryColor);
    setSecondaryColor(currentSecondaryColor);
    setLogoWidth(currentLogoWidth);
    setLogoHeight(currentLogoHeight);
    setCustomPrimaryHex('');
    setCustomSecondaryHex('');
    setShowPrimaryPicker(false);
    setShowSecondaryPicker(false);
    setError('');
    setIsEditing(false);
  };

  const getColorPreview = (color: string) => {
    const preset = colorOptions.find(c => c.value === color);
    if (preset) return preset.hex;
    if (isValidHex(color)) return color;
    return '#f97316';
  };

  const { displayWidth, displayHeight } = getDisplayDimensions(logoWidth, logoHeight);
  const willBeScaled = displayWidth !== logoWidth || displayHeight !== logoHeight;
  const isLogoOptimal = logoHeight >= 50 && logoHeight <= 88;

  if (!isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Brand Theme
            </h3>
            <p className="text-sm text-gray-600 mt-1">Customize your profile&apos;s look</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Edit Theme
          </button>
        </div>

        <div className="space-y-4">
          {logoPreview && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Logo</p>
              <div 
                className="bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center p-4"
                style={{ minHeight: '100px' }}
              >
                <img 
                  src={logoPreview} 
                  alt="Logo" 
                  className="object-contain"
                  style={{ 
                    width: `${logoWidth}px`, 
                    height: `${logoHeight}px`,
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Size: {logoWidth}px × {logoHeight}px
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Primary Color</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: getColorPreview(primaryColor) }}
                ></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {colorOptions.find(c => c.value === primaryColor)?.name || 'Custom'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Secondary Color</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: getColorPreview(secondaryColor) }}
                ></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {colorOptions.find(c => c.value === secondaryColor)?.name || 'Custom'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Customize Theme
          </h3>
          <p className="text-sm text-gray-600 mt-1">Upload logo and choose colors</p>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo (Max 5MB)
          </label>
          <div className="space-y-4">
            {logoPreview && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-2">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Live Preview - Fixed 128px Banner
                  </p>
                  {isLogoOptimal && (
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      ✓ Perfect Size!
                    </span>
                  )}
                </div>
                
                <div 
                  className="relative mx-auto rounded-lg flex items-center justify-center overflow-hidden shadow-lg"
                  style={{ 
                    height: `${FIXED_BANNER_HEIGHT}px`,
                    background: `linear-gradient(to right, ${getColorPreview(primaryColor)}, white, ${getColorPreview(secondaryColor)})`,
                    maxWidth: '100%'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="object-contain drop-shadow-lg relative z-10 transition-all duration-200"
                    style={{ 
                      width: `${displayWidth}px`, 
                      height: `${displayHeight}px`,
                      maxWidth: '95%',
                      maxHeight: '95%'
                    }}
                  />
                  
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                    {Math.round(displayWidth)} × {Math.round(displayHeight)}px {willBeScaled && '(scaled)'}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {isLogoOptimal && !willBeScaled && (
                    <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>Perfect! Your logo fits beautifully in the 128px fixed banner.</p>
                    </div>
                  )}
                  {willBeScaled && (
                    <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>Your logo ({logoWidth}×{logoHeight}px) is being scaled down to fit the 128px banner. For best quality, use {Math.round(displayWidth)}×{Math.round(displayHeight)}px or smaller.</p>
                    </div>
                  )}
                  {!isLogoOptimal && !willBeScaled && (
                    <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>Banner height is fixed at 128px. Recommended logo height: 50-88px for optimal appearance.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <label className="flex flex-col items-center justify-center px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                  <span className="text-sm text-gray-600">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">{logoPreview ? 'Change Logo' : 'Click to upload logo'}</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, SVG or JPG</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {logoPreview && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Maximize2 className="w-4 h-4 text-purple-600" />
                    Adjust Logo Size
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-600">Lock ratio</span>
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-700 font-medium">Width</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={MIN_LOGO_SIZE}
                        max={MAX_LOGO_WIDTH}
                        value={logoWidth}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || MIN_LOGO_SIZE)}
                        className="w-16 px-2 py-1 text-sm font-mono text-purple-600 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <span className="text-xs text-gray-500">px</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={MIN_LOGO_SIZE}
                    max={MAX_LOGO_WIDTH}
                    value={logoWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-700 font-medium">Height</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={MIN_LOGO_SIZE}
                        max={MAX_LOGO_HEIGHT}
                        value={logoHeight}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || MIN_LOGO_SIZE)}
                        className="w-16 px-2 py-1 text-sm font-mono text-purple-600 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <span className="text-xs text-gray-500">px</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={MIN_LOGO_SIZE}
                    max={MAX_LOGO_HEIGHT}
                    value={logoHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                <p className="text-xs text-gray-600 bg-white rounded p-2 border border-purple-200">
                  💡 The banner stays at 128px height. Logos larger than ~88px height will be automatically scaled to fit!
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Color
          </label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  setPrimaryColor(color.value);
                  setCustomPrimaryHex('');
                  setShowPrimaryPicker(false);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  primaryColor === color.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: color.hex }}></div>
                <span className="text-xs font-medium text-gray-700">{color.name}</span>
              </button>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <button
              type="button"
              onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 mb-3"
            >
              <Pipette className="w-4 h-4" />
              {showPrimaryPicker ? 'Hide' : 'Use'} Custom Color
            </button>
            
            {showPrimaryPicker && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={getColorPreview(primaryColor)}
                    onChange={(e) => handleCustomPrimaryColor(e.target.value)}
                    className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#000000"
                    value={customPrimaryHex || (isValidHex(primaryColor) ? primaryColor : '')}
                    onChange={(e) => {
                      const hex = e.target.value;
                      setCustomPrimaryHex(hex);
                      if (isValidHex(hex)) {
                        setPrimaryColor(hex);
                      }
                    }}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500">Enter a hex color code (e.g., #10B981)</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Secondary Color
          </label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  setSecondaryColor(color.value);
                  setCustomSecondaryHex('');
                  setShowSecondaryPicker(false);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                  secondaryColor === color.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: color.hex }}></div>
                <span className="text-xs font-medium text-gray-700">{color.name}</span>
              </button>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <button
              type="button"
              onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 mb-3"
            >
              <Pipette className="w-4 h-4" />
              {showSecondaryPicker ? 'Hide' : 'Use'} Custom Color
            </button>
            
            {showSecondaryPicker && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={getColorPreview(secondaryColor)}
                    onChange={(e) => handleCustomSecondaryColor(e.target.value)}
                    className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="#000000"
                    value={customSecondaryHex || (isValidHex(secondaryColor) ? secondaryColor : '')}
                    onChange={(e) => {
                      const hex = e.target.value;
                      setCustomSecondaryHex(hex);
                      if (isValidHex(hex)) {
                        setSecondaryColor(hex);
                      }
                    }}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500">Enter a hex color code (e.g., #10B981)</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Color Preview</p>
          <div className="flex items-center gap-3">
            <div 
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: getColorPreview(primaryColor) }}
            >
              Primary
            </div>
            <div 
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: getColorPreview(secondaryColor) }}
            >
              Secondary
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Theme'}
          </button>
        </div>
      </div>
    </div>
  );
}