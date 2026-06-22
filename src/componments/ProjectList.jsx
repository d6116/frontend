import React from 'react'
import { useState, useEffect } from 'react'
 


const ProjectList = () => {
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    // 2. פונקציה לקריאת הנתונים מה-API
    const fetchProjects = async () => {
        try {
            setIsLoading(true)
            const response =  BASE_URL// הניתוב שלך
            if (!response.ok) {
                throw new Error('שגיאה בטעינת הנתונים')
            }
            const data = await response.json()
            setProjects(data) // עדכון הסטייט עם הנתונים מהבקאנד
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }
    // 3. הרצת הפונקציה בטעינה הראשונית של הקומפוננטה
    useEffect(() => {
        fetchProjects()
    }, [])
    // 4. טיפול במצבי טעינה ושגיאה (אופציונלי אך מומלץ)
    if (isLoading) return <p>טוען פרויקטים...</p>
    if (error) return <p>שגיאה: {error}</p>

    return(
        <>
        <section>
            {
                projects?.map((project) => (
                   <p>{project.description}</p>
                ))


                
            }
        </section>
        </>
    )
}

export default ProjectList
