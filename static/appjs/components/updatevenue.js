const UpdateVenue = Vue.component("Updatevenue", {
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
                    <div class="card center" style="margin:auto; margin-top:3%; width: 70%;">
                    <div class=" card-body" style="width: 100%; margin:auto;">
                    <div style="margin:5%;">
                    <form @submit.prevent="updateVenue">
                    <div class="form-group">
                        <label for="venue-name">Venue Name</label>
                        <input type="text" class="form-control" id="venue-name" v-model="venueName">
                    </div>
                    <div class="form-group">
                        <label for="venue-location">Venue Location</label>
                        <input type="text" class="form-control" id="venue-location" v-model="venueLocation">
                    </div>
                    <br>
                    <button type="submit" class="btn">Update Venue</button>
                    <button type="button" class="btn" @click="$router.go(-1)">Cancel</button>
                    </form>
                    </div>
                    </div>
                    </div>
                </div>
    `,
    props: ['id'],
    data() {
        return {
            venueName: '',
            venueLocation: ''
          }
      },
      mounted() {
        fetch(`/updatevenue/${this.id}`, {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
      })
          .then(response => response.json())
          .then(data => {
            this.venueName = data.name;
            this.venueLocation = data.location;
          });
      },
      methods: {
        logout() {
          localStorage.removeItem('access_token');
          this.$router.push('/');
      },
        updateVenue() {
          const venueData = {
            name: this.venueName,
            location: this.venueLocation
          };
          fetch(`/updatevenue/${this.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
            body: JSON.stringify(venueData)
          })
            .then(() => {
              this.$router.push('/admin');
            });
        }
      }
})

export default UpdateVenue;