import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { supabase } from '../supabaseClient'; // Make sure your Supabase client is imported here!
import { apiRequest } from '../services/api';

const CreateProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        website: '',
        githubLink: ''
    });

    // Track the current or newly uploaded image URL string
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    // Line 26 - Your explicit upload handler linked directly to the bucket storage flow
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            setLoading(true);
            setStatusMsg({ text: 'Uploading cover image to grid...', type: 'loading' });

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { data, error } = await supabase.storage
                .from('project-img')
                .upload(filePath, file);

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('project-img')
                .getPublicUrl(filePath);

            // Saves the clean URL string directly to the state for immediate preview and database tracking
            setUploadedImageUrl(urlData.publicUrl);
            setStatusMsg({ text: 'Image uploaded successfully!', type: 'success' });
        } catch (error) {
            console.error("Error while uploading: ", error.message);
            setStatusMsg({ text: `Upload failed: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ... (previous state definitions remain the same)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg({ text: isEditMode ? 'Saving system changes...' : 'Publishing project...', type: 'loading' });

        const projectAuthor = user?.username || user?.firstName || 'Anonymous Builder';
        // Dynamically retrieve the verified active email from Clerk
        const projectEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Build standard JSON payload object with the uploaded URL and email tracking
        const jsonPayload = {
            title: formData.title,
            description: formData.description,
            website: formData.website,
            githubLink: formData.githubLink,
            author: projectAuthor,
            author_email: projectEmail,
            img: uploadedImageUrl
        };

        // 1. Clean up endpoints to utilize relative paths for apiRequest
        const endpoint = isEditMode
            ? `/api/projects/edit/${id}`
            : '/api/projects';

        const method = isEditMode ? 'PUT' : 'POST';

        try {
            // 2. Use apiRequest instead of fetch. 
            // It injects BASE_URL, checks response.ok, and automatically parses the response.
            const data = await apiRequest(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonPayload),
            });

            setStatusMsg({
                text: isEditMode ? 'System changes saved successfully!' : 'Project deployed to grid!',
                type: 'success'
            });

            setTimeout(() => {
                navigate(isEditMode ? `/project/${id}` : '/');
            }, 1500);

        } catch (err) {
            // Your apiRequest utility throws standard errors like "API error: 400"
            // If you want a friendlier message than the status code number, you can customize it here:
            const friendlyError = isEditMode ? 'Failed to update project data' : 'Failed to create new project';
            setStatusMsg({ text: `${friendlyError} (${err.message})`, type: 'error' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch details if in Edit Mode
    useEffect(() => {
        if (!isEditMode) return;

        const fetchProjectDetails = async () => {
            try {
                setLoading(true);

                // Using your apiRequest function:
                // It automatically appends BASE_URL, checks response.ok, and returns parsed JSON.
                const data = await apiRequest(`/api/projects/${id}`);

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    website: data.website || '',
                    githubLink: data.githubLink || ''
                });

                if (data.img) {
                    setUploadedImageUrl(data.img); // Load the existing image link from records
                }
            } catch (err) {
                // Your utility throws `API error: ${response.status}`, which ends up here
                setStatusMsg({ text: 'Error loading project data.', type: 'error' });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [isEditMode, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="create-project-page">
            <div className="form-card">
                <h1>{isEditMode ? 'Edit Project' : 'Share Your Build'}</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-div">
                        <label>Project Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Mini Analog Raytracer"
                        />
                    </div>

                    {/* Image Upload Input Area */}
                    <div className="form-div">
                        <label>Project Display Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="file-input"
                            onChange={handleFileChange}
                        />
                        {uploadedImageUrl && (
                            <div style={{ marginTop: '15px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '16/9' }}>
                                <img src={uploadedImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>

                    <div className="form-div">
                        <label>Live Build Demo Link</label>
                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://yourdemo.com"
                        />
                    </div>

                    <div className="form-div">
                        <label>GitHub Source Code Link</label>
                        <input
                            type="text"
                            name="githubLink"
                            value={formData.githubLink}
                            onChange={handleInputChange}
                            placeholder="https://github.com/username/repo"
                        />
                    </div>

                    <div className="form-div">
                        <label>About This Build</label>
                        <textarea
                            name="description"
                            rows="5"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Detail your system architecture, custom configurations, or code mechanics..."
                        />
                    </div>

                    {statusMsg.text && (
                        <div className={`status-msg ${statusMsg.type}`}>
                            {statusMsg.type === 'error' ? '⚠️ ' : statusMsg.type === 'success' ? '✅ ' : '⏳ '}
                            {statusMsg.text}
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {isEditMode ? 'Commit System Changes' : 'Deploy To Hub'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;