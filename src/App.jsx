
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './Layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dasboard'
import Project from './pages/Project/Project'
import ProjectSettings from "./pages/Project/ProjectSetting.jsx";
function App() {

  return (
      <>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route path='/' element ={<Dashboard/>}/>
        </Route>
        <Route path = "/project" element={<Project/>}/>
          <Route path = "/project/settings" element={<ProjectSettings/>}/>
      </Routes>
      </>
  )
}

export default App
