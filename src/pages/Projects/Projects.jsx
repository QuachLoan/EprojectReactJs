import ProjectsCard from "./ProjectsCard/ProjectsCard";

function Projects(){
    return(
    <>
         <main class="page-content">
        <div class="page-content-inner">
          <div class="page-header">
            <div><h1>Projects</h1><p class="page-subtitle">All the boards your team is working on.</p></div>
            {/* <button class="btn btn-primary" data-open-modal="createProjectModal"><span class="icon icon-sm" data-icon="plus"></span>Create Project</button> */}
          </div>

            <ProjectsCard/>
        </div>
      </main>
    </>
    )
}
export default Projects;