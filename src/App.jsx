
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './Layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dasboard'
import Projects from './pages/Projects/Projects'
import Project from './pages/Project/Project'
import ProjectSettings from "./pages/Project/ProjectSetting.jsx";
function App() {

  return (
      <>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='/dashboard' element ={<Dashboard/>}/>
          <Route path='/Projects' element={<Projects/>}/>
        </Route>
        <Route path = "/project" element={<Project/>}/>
          <Route path = "/project/settings" element={<ProjectSettings/>}/>
      </Routes>
      </> 
  )
}

export default App
