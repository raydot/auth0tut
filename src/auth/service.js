// src/auth/service.js

// imports
import { config } from './config'
import * as Auth0 from 'auth0-js'

class Auth {
  auth0 = new Auth0.WebAuth({
    domain: config.domain,
    clientId: config.clientId,
    redirectUri: config.redirect,
    audience: config.audience,
    responseType: 'id_token token',
    scope: 'openid profile email'
  })

  /*
    A logged in user will activate a few different functions.
    The login function which will call localLogin.  LocalLogin (below)
    will save a bunch of files to the variables above.  UserProfile
    will be passed the authenticated results of idTokenPayload which has info like email, first and last name, and picture.

    It will also save the accessToken to a header.
  */

  loginCallback = () => {}
  logoutCallback = () => {}

  userProfile = null
  authFlag = 'isLoggedIn'
  authStatus = this.isAuthenticated // yet to come!
    ? 'init_with_auth_flag'
    : 'init_no_auth_flag'
  idToken = null
  idTokenPayload = null
  accessToken

  localLogin(authResult) {
    this.idToken = authResult.idToken
    this.userProfile = authResult.idTokenPayload
    this.accessToken = authResult.accessToken
    this.loginCallback({ loggedIn: true})
  }

  localLogout() {
    localStorage.removeItem(this.authFlag) // where should this be stored?!
    this.userProfile = null
    this.logoutCallback ({ loggedIn: false })
  }

  // Accessing the access token
  getAccessToken() {
    return this.accessToken
  }

  // LOGGING IN
  /*
    when our user clicks the login button, fire off the login.
   this.auth0.popup.authorize() will activate the popup.
   Then we'll check for authenticated or now.

   If the user info is passed through, this function will grant an 
   access token.  If not, localLogout() will take over.

   isAuthenticated() will also set the localStorage authFlag to 'true'
  */

  login() {
    this.auth0.popup.authorize({}, (err, authResult) => {
      console.log(err, authResult)
      if (err) this.localLogout()
      else {
        this.localLogin(authResult)
        this.accessToken = authResult.accessToken
      }
    })
  }

  isAuthenticated() {
    return localStorage.getItem(this.authFlag) === 'true'
  }

  logout() {
    this.localLogout()
    this.auth0.logout({
      returnTo: config.logoutUrl,
      clientId: config.clientId
    })
  }

  /*
    We are going to want to use this information freely throughout
    our application, so we will create a new instance of Auth()
    every time.
  */

}

const auth = new Auth()
export default auth


