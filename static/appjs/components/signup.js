const Signup = Vue.component('Signup', {
    template : `
    <div>
    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #D14D72; padding: 5px;">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Showtime</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/" class="nav-link">LogIn</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/signup" class="nav-link">SignUp</router-link>
          </li>
          <li class="nav-item">
          <router-link to="/adminlogin" class="nav-link">Admin</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
    <br>
        <div class="center white" style="text-align:center;">
            <h1> Sign Up </h1>
            <form @submit.prevent="signup">
                <input type="text" id="name" v-model="name" placeholder="Name">
                <br>
                <br>
                <input type="text" id="umail" v-model="umail" placeholder="E-Mail">
                <br>
                <br>
                <input type="text" id="username" v-model="username" placeholder="Username">
                <br>
                <br>
                <input type="password" id="password" v-model="password" placeholder="password">
                <br>
                <br>
                <button class="btn btn-lg btn-primary btn-block" type="submit">Sign Up</button>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            username: '',
            password: '',
            name: '',
            umail: ''
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push('/');
        },
        signup() {
          // signup logic...
          fetch('/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              username: this.username,
              password: this.password,
              name: this.name,
              umail: this.umail
            })
          })
          .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                // Get error message from body or default to response statusText
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
        })
        .then(data => {
            localStorage.setItem('access_token', data.access_token);
            this.$router.push('/home');
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Signup failed. Enter valid entries and Please try again.");
        });
        }
      }      
})

export default Signup