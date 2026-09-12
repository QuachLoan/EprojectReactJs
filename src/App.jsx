
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './Layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dasboard'
import Project from './pages/Project/Project'
function App() {

  return (
      <>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='/dashboard' element ={<Dashboard/>}/>
        </Route>
        <Route path = "/project" element={<Project/>}/>
      </Routes>
      </> 
  )
}

export default App
