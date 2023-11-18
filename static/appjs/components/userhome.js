const UserHome = Vue.component("home", {
    template : `
                <div>
                <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #D14D72; padding: 5px;">
                    <div class="container-fluid">
                    <a class="navbar-brand" href="#">Showtime</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mb-2 mb-lg-0 ms-auto">
                <li class="nav-item">
                                    <router-link to="/search" class="nav-link">Search</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/home" class="nav-link">Dashboard</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/mybookings" class="nav-link">Bookings</router-link>
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
                                                <p class="text-muted" style="margin-bottom:2px; ">{{show.date}}</p>
                                                <p class="text-muted" style="margin-bottom:1px; ">{{show.tag}} ⭐{{show.rating}}</p>
                                                <p class="text-muted" style="margin-bottom:1px; ">Price {{show.price}}</p>
                                                <router-link :to="{ name: 'book-ticket', params: { showId: show.id } }" class="btn">Book</router-link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
    `,
    data : function(){
        return {
            venues: []
        }
    },
    mounted : function(){
        fetch('/api/venues', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
        }).then(response => response.json()).then(data => {this.venues = data;});
    },
    methods : {
        logout() {
          localStorage.removeItem('access_token');
          this.$router.push('/');
      },
    }
})

export default UserHome;