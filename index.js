var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	var sessionlog = login.displaySessions();
	console.log("GET REQUEST RECEIVED");
	console.log("cookies in request:\n");
	console.log(cookies);
	console.log("Active sessions:\n")
	console.log(sessionlog);

	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) {
	// TODO: read 'name and email from the request.body'
	// var newSessionId = login.login('xxx', 'xxx@gmail.com');
	// TODO: set new session id to the 'session_id' cookie in the response
	// replace "Logged In" response with response.end(login.hello(newSessionId));
	
	/* newly added code starts */
	//We are assuming that POST will always create a new session for the user, no matter if the user is already logged in.
	//This is because there is no way to check if the user is already logged in since only session_id attribute is defined in the sessionmap.
	var newSessionId = login.login(request.body.name, request.body.email);
	response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
	response.end(login.hello(newSessionId));
	/* newly adde code ends*/

	//Not required anymore. Code will never reach here since you are ending the response earlier.
	//Also according to assignment you dont need this line
	//response.end("Logged In\n");
};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
 	// TODO: remove session id via login.logout(xxx)
 	// No need to set session id in the response cookies since you just logged out!
 	
 	/* newly added code starts */
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			login.logout(sid);			
			response.end('Logged out from the server\n');
		} else {
			response.end("Invalid session_id! Cannot log out\n");
		}
	} else {
		response.end("Please use cookies while using DELETE\n");
	}
	/* newly added code ends */
  	
};

function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	// TODO: refresh session id; similar to the post() function
	
	/* newly added code starts */
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			//Generate new session ID here. There are two approaches:
			//1. Generate new session and leave existing session as is. Requires name and email from existing session.
			//2. Generate new session and delete existing session. Requires name and email from existing session.
			//Using approach #2
			var newSessionId = login.update(sid); 
			response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
			response.end("Re-freshed session id\n");
		} else {
			//Do not display this message. According to assignment requirement, PUT will only come AFTER POST
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please use cookies while using PUT\n");
	}
	/* newly added code ends */

};

app.listen(8000);

console.log("Node.JS server running at 8000...");
