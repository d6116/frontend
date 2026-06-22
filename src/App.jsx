import { useState } from 'react'
import './App.css' 
import './showcase.css'
//import './App2.css'
import CreateProjectPage from './pages/CreateProjectPage'
import ProjectList from './componments/ProjectList'
import { Route, Routes } from 'react-router-dom'
import Header from './componments/Header'
import ProjectDetails from './pages/ProjectDetails'
import HomePage from './pages/HomePage'
import CommunityPage from './pages/CommunityPage'
import ProjectGrid from './pages/ProjectDetails'
import ShowcasePage from './pages/ShowcasePage'

function App() {

  return (
    <>
      <Header/>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/create' element={<CreateProjectPage/>} />
        <Route path='/project/:id' element={<ProjectDetails/>} />
        <Route path="/edit/:id" element={<CreateProjectPage />} />
        <Route path='/usershowcase' element={<ProjectGrid filterOwned='true'/>}/>
        <Route path='/showcase' element={<ShowcasePage/>}/>
      </Routes>
    </>
  )
}



export default App
