
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './Layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dasboard'
function App() {

  return (
      <>
      <Routes>
        <Route element={<MainLayout/>}>
          <Route path='/' element ={<Dashboard/>}/>
        </Route>
      </Routes>
      </>
  )
}

export default App
