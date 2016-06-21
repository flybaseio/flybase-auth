# Flybase Auth

A Javascript RESTFUL API library for connecting with OAuth2 services, such as Google+ API, Facebook Graph and Windows Live Connect, complete with Angular.js support.

Angular.js or vanilla JS wrapper for https://adodson.com/hello.js/

---

## Quick Start
Quick start shows you how to go from zero to loading in the name and picture of a user, like in the demo above.


- [Register your app domain](#1-register)
- [Include flybaseauth.js script](#2-include-flybaseauthjs-script-in-your-page)
- [Create the sign-in buttons](#3-create-the-signin-buttons)
- [Setup listener for login and retrieve user info](#4-add-listeners-for-the-user-login)
- [Initiate the client_ids and all listeners](#5-configure-hellojs-with-your-client_ids-and-initiate-all-listeners)


### 1. Register

Register your application with at least one of the following networks. Ensure you register the correct domain as they can be quite picky.


- [Facebook](https://developers.facebook.com/apps)
- [Windows Live](https://account.live.com/developers/applications/index)
- [Google+](https://code.google.com/apis/console/b/0/#:access)


### 2. Include Flybaseauth.js script in your page

```html
<script src="https://cdn.flybase.io/flybaseauth.min.js"></script>
```

### 3. Create the sign-in buttons

Just add onclick events to call `flybaseauth(network).login()`. 

```html
<button onclick="flybaseauth('facebook').login()">Facebook</button>
```

### 4. Add listeners for the user login

Let's define a simple function, which will load a user profile into the page after they sign in and on subsequent page refreshes. Below is our event listener which will listen for a change in the authentication event and make an API call for data.

```javascript
flybaseauth.on('auth.login', function(auth) {

	// Call user information, for the given network
	flybaseauth(auth.network).api('me').then(function(r) {
		// Inject it into the container
		var label = document.getElementById('profile_' + auth.network);
		if (!label) {
			label = document.createElement('div');
			label.id = 'profile_' + auth.network;
			document.getElementById('profile').appendChild(label);
		}
		label.innerHTML = '<img src="' + r.thumbnail + '" /> Hey ' + r.name;
	});
});
```

### 5. Configure flybaseauth.js with your client IDs and initiate all listeners

Now let's wire it up with our registration detail obtained in step 1. By passing a [key:value, ...] list into the `flybaseauth.init` function. e.g....

```javascript
flybaseauth.init({
	facebook: FACEBOOK_CLIENT_ID,
	windows: WINDOWS_CLIENT_ID,
	google: GOOGLE_CLIENT_ID
}, {redirect_uri: 'redirect.html'});
```

That's it. The code above actually powers the demo at the start so, no excuses.
