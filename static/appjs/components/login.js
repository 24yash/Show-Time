const Login = Vue.component('Login', {
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
            <a class="nav-link" href="#">Login</a>
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
        <div class="center white" style="text-align: center;">
            <h1> Log In </h1>
            <form @submit.prevent="login">
                <input type="text" id="username" v-model="username" placeholder="Username">
                <br>
                <br>
                <input type="password" id="password" v-model="password" placeholder="password">
                <br>
                <br>
                <button class="btn btn-lg btn-primary btn-block" type="submit">Log in</button>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            username: '',
            password: ''
        }
    },
    methods: {
        login() {
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password
                })
            })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Invalid credentials");
                }
            })
            .then(data => {
                localStorage.setItem('access_token', data.access_token);
                this.$router.push('/home');
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Invalid credentials. Please try again.");
            })
        }
    }
})


export default Login