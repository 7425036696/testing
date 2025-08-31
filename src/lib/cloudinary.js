import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const {
            projectId,
            userId,
            projectType = 'youtube',
            aspectRatio = '16:9',
            isEditMode = false,
            originalThumbnailId = null,
        } = options;

        // Create a unique public_id with project context
        const timestamp = Date.now();
        const editPrefix = isEditMode ? 'edited_' : '';
        const publicId = projectId 
            ? `thumbnails/${editPrefix}project_${projectId}/${timestamp}`
            : `thumbnails/${editPrefix}user_${userId}/${timestamp}`;

        const uploadOptions = {
            public_id: publicId,
            folder: `ai-thumbnails/${projectType}`,
            resource_type: 'image',
            format: 'png',
            transformation: [
                {
                    quality: 'auto:good',
                    fetch_format: 'auto'
                }
            ],
            context: {
                project_id: projectId || '',
                user_id: userId,
                project_type: projectType,
                aspect_ratio: aspectRatio,
                generated_at: new Date().toISOString(),
                is_edit_mode: isEditMode.toString(),
                original_thumbnail_id: originalThumbnailId || '',
            },
            tags: [
                'ai-generated',
                `project-${projectType}`,
                `aspect-${aspectRatio.replace(':', 'x')}`,
                ...(projectId ? [`project-${projectId}`] : []),
                `user-${userId}`,
                ...(isEditMode ? ['edited-content'] : ['original-content']),
                ...(originalThumbnailId ? [`edited-from-${originalThumbnailId}`] : []),
            ]
        };

        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    console.log('✅ Image uploaded to Cloudinary:', result.public_id);
                    resolve({
                        cloudinaryId: result.public_id,
                        url: result.secure_url,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes,
                        createdAt: result.created_at,
                        tags: result.tags,
                        context: result.context
                    });
                }
            }
        ).end(buffer);
    });
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Image deleted from Cloudinary:', publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export default cloudinary;
