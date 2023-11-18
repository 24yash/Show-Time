import AdminHome from "./components/adminhome.js"
import Sales from "./components/sales.js"
import AddVenue from "./components/addvenue.js"
import UpdateVenue from "./components/updatevenue.js"
import AddShow from "./components/addshow.js"
import UpdateShow from "./components/updateshow.js"

import UserHome from "./components/userhome.js"
import MyBookings from "./components/bookings.js"
import Search from "./components/search.js"
import BookTicket from "./components/bookticket.js"
import Login from "./components/login.js"
import Signup from "./components/signup.js"
import AdminLogin from "./components/adminlogin.js"
import AdminSignup from "./components/adminsignup.js"


const routes = [
    {
        path: "/admin",
        component: AdminHome,
        name: 'adminhome',
    },
    {
      path: "/adminlogin",
      component: AdminLogin,
      name: 'adminlogin'
    },
    {
      path: "/adminsignup",
      component: AdminSignup,
      name: 'adminsignup'
    },
    {
      path: "/signup",
      component: Signup,
      name: 'signup'
    },
    {
      path: "/home",
      component: UserHome,
      name: 'userhome'
    },
    {
        path: "/summary",
        component: Sales,
    },
    {
        path: "/newvenue",
        component: AddVenue,
    },
    {
        path: '/update-venue/:id',
        name: 'update-venue',
        component: UpdateVenue,
        props: true
    },
    {
        path: '/venues/:id/shows/new',
        name: 'add-show',
        component: AddShow,
        props: true
    },
    {
        path: '/shows/:id/edit',
        name: 'update-show',
        component: UpdateShow,
        props: true
    },

    {
        path: "/",
        component: Login,
    },
    {
        path: "/mybookings",
        component: MyBookings,
    },
    { 
        path: '/search',
        component: Search 
    },
    {
        path: '/book/:showId',
        name: 'book-ticket',
        component: BookTicket,
        props: true
    }
]

const router = new VueRouter({
    routes
})

export default router;