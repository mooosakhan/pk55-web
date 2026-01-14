# Image Compression Feature

## Overview
Automatic image compression has been implemented for all image uploads in the admin dashboard. Images larger than 1000KB (1MB) are automatically compressed before being uploaded to the server.

## How It Works

### Compression Logic
- **Threshold**: 1000KB (1MB)
- **Process**: 
  - If an image is ≤ 1000KB, it's uploaded without modification
  - If an image is > 1000KB, it's automatically compressed using HTML5 Canvas API
  - Compression starts at 90% quality and reduces in 10% increments until file size is ≤ 1000KB or quality reaches 10%
  - Compressed images are converted to JPEG format for optimal compression

### Where It's Applied
1. **New Image Upload**: When uploading images from the admin dashboard
2. **Replace Image**: When replacing existing images in the edit modal

### User Feedback
- File size is displayed when selecting an image
- Color-coded messages:
  - **Green**: File is under 1000KB - no compression needed
  - **Orange**: File is over 1000KB - will be compressed
- Success message shows before/after compression sizes

## Files Modified
- `/app/admin/dashboard/page.tsx` - Updated upload and replace handlers
- `/utils/imageCompression.ts` - New utility for image compression

## Technical Details
```typescript
// Compression function signature
compressImage(file: File): Promise<File>

// Helper function
formatFileSize(bytes: number): string
```

## Benefits
1. **Faster uploads**: Smaller file sizes = quicker uploads
2. **Reduced bandwidth**: Less data transferred
3. **Storage optimization**: Smaller files on the server
4. **Better performance**: Faster page loads and image rendering
5. **User-friendly**: Automatic with clear feedback

## Example
- Original image: 2.5 MB
- After compression: 950 KB (62% reduction)
- Upload time reduced significantly
