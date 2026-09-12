
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './Layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dasboard'
import Project from './pages/Project/Project'
import Login from './pages/Login/Login'
import ProjectBoard from "./pages/Project/ProjectBoard.jsx";
import MyTasks from './pages/MyTasks/MyTasks.jsx'
function App() {

  return (
      <>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='/dashboard' element ={<Dashboard/>}/>
          <Route path='/myTasks' element ={<MyTasks/>}/>
        </Route>
        <Route path = "/project" element={<Project/>}/>
          <Route path = "/Login" element={<Login/>}/>
          <Route path="/projectboard/:id" element={<ProjectBoard />} />
      </Routes>
      </> 
  )
}

export default App
