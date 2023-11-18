const AdminHome = Vue.component("adminhome", {
    template: `
                <div v-if="isAdmin">
                  <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #D14D72; padding: 5px;">
                    <div class="container-fluid">
                      <a class="navbar-brand" href="#">Showtime</a>
                      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                      </button>
                      <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">
                          <li class="nav-item">
                            <router-link to="/admin" class="nav-link">Dashboard</router-link>
                          </li>
                          <li class="nav-item">
                            <router-link to="/summary" class="nav-link">Sales</router-link>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" @click="logout">Logout</a>
                          </li>
                
                        </ul>
                      </div>
                    </div>
                  </nav>
                    <div v-for="venue in venues" :key="venue.id" style="margin:2%;">
                    <div class="card" style="width: 100%;">
                        <div class="card-body">
                        <h2>{{ venue.name }}  {{venue.location }}</h2>
                        <div class="d-flex flex-wrap">
                            <div v-for="show in venue.shows" :key="show.id">
                            <div class="card" style="width: 220px; margin:20px;">
                                <div class="card-body">
                                <h6>{{ show.name }}</h6>
                                <p class="text-muted" style="margin-bottom:1px; ">{{show.tag}} ⭐{{show.rating}}</p>
                                <p class="text-muted" style="margin-bottom:2px; ">{{show.date}}</p>
                                <br>
                                <div class="d-flex">
                                    <router-link :to="{ name: 'update-show', params: { id: show.id } }" class="btn btn-white" style="margin-right:8px;"><i class="fa-solid fa-pen"></i></router-link>
                                    <button @click="deleteShow(show.id)" class="btn btn-white"><i class="fa-solid fa-trash"></i></button>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                        <button @click="exportTheater(venue.id)" class="btn btn-white" style="position:absolute;top:10px;right:205px;  margin:1%">Export CSV</button>
                        <router-link :to="{ name: 'add-show', params: { id: venue.id } }" class="btn btn-white"
                            style="position: absolute; top: 10px; right: 10px; margin:1%"><i class="fa-solid fa-plus"></i></router-link>
                        <br>
                        <router-link :to="{ name: 'update-venue', params: { id: venue.id } }" class="btn btn-white"
                            style="position:absolute;top:10px;right:75px;  margin:1%"><i class="fa-solid fa-pen"></i></router-link>
                        <button @click="deleteVenue(venue.id)" class="btn btn-white"
                            style="position:absolute;top:10px;right:140px;  margin:1%"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    </div>
                    <div style="margin:5%;">
                    <router-link to="/newvenue" class="btn btn-white">Add Venue</router-link>
                    </div>
                </div> 
  `,
    data : function(){
        return {
            venues: [],
            isAdmin: false
        }
    },
    mounted : function(){
      fetch('/api/is-admin', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
      }).then(response => response.json()).then(data => {
        this.isAdmin = data.isAdmin;
      });
        fetch('/api/venues', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
      }).then(response => response.json()).then(data => {this.venues = data;});
    },
    methods : {
      logout() {
        localStorage.removeItem('access_token');
        this.$router.push('/');
    },
        deleteVenue(id) {
            if (confirm("Are you sure you want to delete this venue?")) {
              fetch(`/delete/venue/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') } }).then(() => {
                fetch('/api/venues', {
                  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
              }).then(response => response.json()).then(data => {
                  this.venues = data;
                });
              });s
            }
        },
        deleteShow(id) {
            if (confirm("Are you sure you want to delete this show?")) {
                fetch(`/delete/show/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') } }).then(() => {
                  fetch('/api/venues', {
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
                }).then(response => response.json()).then(data => {
                    this.venues = data;
                  });
                });
              }
        },
        exportTheater(venue_id) {

            fetch(`/trigger-celery-job/${venue_id}`).then(r => r.json()
            ).then(d => {
              console.log("Celery Task Details:", d);
              let interval = setInterval(() => {
                fetch(`/status/${d.Task_ID}`).then(r => r.json()
                ).then(d => {
                    if (d.Task_State === "SUCCESS") {
                      console.log("task finished")
                      clearInterval(interval);
                      window.location.href = "/download-file";
                    }
                    else {
                      console.log("task still executing")
                    }
                })
              }, 4000)
            })
          }
    },
    
})

export default AdminHome;