import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);

        // Using your apiRequest function correctly:
        // 1. It automatically appends the BASE_URL
        // 2. It automatically checks response.ok and throws an error if it fails
        // 3. It automatically returns the response.json()
        const data = await apiRequest(`/api/projects/${id}`);

        setProject(data);
      } catch (err) {
        // Since your utility throws `new Error("API error: ...")`, 
        // err.message will capture that perfectly.
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm('האם אתה בטוח שברצונך למחוק את הפרויקט? פעולה זו בלתי הפיכה.');

    if (!isConfirmed) {
      return;
    }

    try {
      // שימוש ב-apiRequest והעברת אובייקט ההגדרות (method, headers, body)
      await apiRequest(`/api/projects/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: currentUserEmail })
      });

      // אין צורך לבדוק !response.ok, אם הגענו לכאן - המחיקה הצליחה
      alert('הפרויקט נמחק בהצלחה');
      navigate('/');
    } catch (err) {
      // במקרה של שגיאה (למשל חוסר הרשאה), ה-catch יתפוס אותה מיד
      alert(`שגיאה: ${err.message}`);
    }
  };

  // Styled Error State
  if (error) {
    return (
      <div className="project-page-container">
        <div className="state-card error">
          <div className="error-icon">⚠️</div>
          <h3>An Error Occurred</h3>
          <p>{error}</p>
          <button className="back-home-btn" onClick={() => navigate('/')}>Back to Explore</button>
        </div>
      </div>
    );
  }

  // Styled Not Found State
  if (!project) {
    return (
      <div className="project-page-container">
        <div className="state-card error">
          <div className="error-icon">🔍</div>
          <h3>Project Not Found</h3>
          <p>We couldn't find the project you are looking for.</p>
          <button className="back-home-btn" onClick={() => navigate('/')}>Back to Explore</button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-page-container">
      <div className="axl-project-details">
        <header className="details-header">
          <h1 className="project-title">{project.title}</h1>
          <p className="project-author">Created by <span>{project.author || 'Anonymous'}</span></p>
        </header>

        {project.img && (
          <div className="details-image-wrapper">
            <img src={project.img} alt={project.title} className="project-hero-img" />
          </div>
        )}

        <div className="details-body">
          <h3>About this project</h3>
          <p className="project-description">{project.description}</p>
        </div>

        <div className="project-actions-wrapper">
          <div className="axl-project-links">
            {project.website && (
              <a href={project.website} target="_blank" rel="noreferrer" className="link-btn primary">
                Live Demo
              </a>
            )}
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noreferrer" className="link-btn secondary">
                GitHub Repository
              </a>
            )}
          </div>

          <div className="danger-zone">
            <button
              onClick={() => navigate(`/edit/${id}`)} /* Updated here to match your exact path layout */
              className="edit-btn"
            >
              Edit Project
            </button>
            <button
              onClick={handleDelete}
              className="delete-btn"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;