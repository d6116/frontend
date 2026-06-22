import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { apiRequest } from '../services/api';
//import { API_BASE_URL } from '../utils/config';

const ProjectGrid = ({ filterOwned = false }) => {
    const { user, isLoaded } = useUser();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    //useEffect(() => {
    // const fetchProjects = async () => {
    //     try {
    //         setLoading(true);
    //         const response = API_BASE_URL;

    //         if (!response.ok) {
    //             throw new Error('Failed to fetch projects');
    //             console.log(response)
    //             alert("error")
    //         }

    //         const data = await response.json();
    //         // Ensure data is an array before setting state
    //         setProjects(Array.isArray(data) ? data : []);
    //     } catch (err) {
    //         setError(err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };



    //}, []);
    const fetchProjects = async () => {
        try {
            setLoading(true);
            // מעבירים רק את הנתיב היחסי. הכתובת המלאה מורכבת אוטומטית בתוך apiRequest
            const data = await apiRequest('/api/projects');
            setProjects(data);
        } catch (err) {
            // אם השרת יחזיר שגיאה, apiRequest תזרוק אותה ותגיע ישירות לכאן
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="grid-status-container">
                <div className="state-card loading">
                    <div className="spinner"></div>
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid-status-container">
                <div className="state-card error">

                    <h3>An Error Occurred</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Filter projects client-side if filterOwned is true
    const displayedProjects = filterOwned && isLoaded
        ? projects.filter(project => project.author_email === user?.primaryEmailAddress?.emailAddress)
        : projects;

    // --- NEW: Handle empty database safely ---
    if (displayedProjects.length === 0) {
        return (
            <div className="grid-status-container">
                <div className="state-card empty">

                    <h3>No Projects Yet</h3>
                    <p>Be the first one to share a project with the community!</p>
                    <button className="back-home-btn" onClick={() => navigate('/create')}>
                        Create a Project
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="projects-container">
            <h1 className="grid-title">{filterOwned? "Your Projects" : "Community Projects"}</h1>
            <div className="projects-grid">
                {displayedProjects.map((project) => (
                    <div
                        key={project.id}
                        className="project-card"
                        onClick={() => navigate(`/project/${project.id}`)}
                        style={{ backgroundImage: `url(${project.img || 'https://via.placeholder.com/400x300?text=No+Image'})` }}
                    >
                        <div className="project-overlay">
                            <div className="overlay-content">
                                <h3>{project.title}</h3>
                                <p className="author-name">by {project.author || 'Anonymous'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectGrid;