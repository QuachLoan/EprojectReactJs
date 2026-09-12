import FilterBar from "./FilterBar/FilterBar";
import NavTasks from "./NavTask/NavTask";

function MyTasks(){
    return(
    <>
          <main class="page-content">
            <div class="page-content-inner stack" style={{gap:'var(--space-4)'}}>
                <div><h1>My Tasks</h1><p class="page-subtitle">Everything assigned to you across all projects.</p></div>
                <NavTasks/>
                 <FilterBar/>
               
            </div>
          </main>

    </>
    )
}
export default MyTasks;