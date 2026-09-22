
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './Layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dasboard'
import Project from './pages/Project/Project'
import Login from './pages/Login/Login'
import ProjectBoard from "./pages/Project/ProjectBoard.jsx";
import MyTasks from './pages/MyTasks/MyTasks.jsx'
import Members from './pages/Members/Members.jsx'
import AdminUsers from './pages/AdminUsers/AdminUsers.jsx'
import AdminMorder from './pages/AdminMorder/AdminMorder.jsx'
import ProjectList from "./pages/Project/ProjectList.jsx";
import ProjectCalendar from "./pages/Project/ProjectCalendar.jsx";
import ProjectSetting from "./pages/Project/ProjectSetting.jsx";
import Register from './pages/Register/Register.jsx'
function App() {

  return (
      <>
      <Routes>
        <Route index element={<Login/>}/>
        <Route element={<MainLayout/>}>
          <Route path='/dashboard' element ={<Dashboard/>}/>
          <Route path='/myTasks' element ={<MyTasks/>}/>
          <Route path='/members' element ={<Members/>}/>
          <Route path='/adminuser' element ={<AdminUsers/>}/>
          <Route path='/adminmoderation' element ={<AdminMorder/>}/>
        </Route>
        <Route path = "/project" element={<Project/>}/>
          <Route path = "/Login" element={<Login/>}/>
           <Route path = "/register" element={<Register/>}/>
          <Route path="/projectboard/:id" element={<ProjectBoard />} />
          <Route path = "/projectlist/:id" element = {<ProjectList/>}/>
          <Route path = "/projectcalendar/:id" element = {<ProjectCalendar/>}/>
          <Route path = "/projectsetting/:id" element = {<ProjectSetting/>}/>
      </Routes>
      </> 
  )
}

export default App
