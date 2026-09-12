function NavTasks(){
    function GetNavActive({isActive}){
        if(isActive){
            return "pill-tab active"
        }else{
            return "pill-tab"
        }
    }
    return(
    <>
        <div class="pill-tabs">
            <button class="pill-tab active" data-tab-group="myTasks" data-tab="all">All</button>
            <button class="pill-tab" data-tab-group="myTasks" data-tab="today">Today</button>
            <button class="pill-tab" data-tab-group="myTasks" data-tab="upcoming">Upcoming</button>
            <button class="pill-tab" data-tab-group="myTasks" data-tab="overdue">Overdue</button>
        </div>
    </>
    )
}
export default NavTasks;