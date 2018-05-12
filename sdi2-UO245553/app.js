// Módulos
var express = require('express');
var app = express();

app.use(function(req, res, next) {
	 res.header("Access-Control-Allow-Origin", "*");
	 res.header("Access-Control-Allow-Credentials", "true");
	 res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
	 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
	 // Debemos especificar todas las headers que se aceptan. Content-Type ,
		// token
	 next();
	});


var jwt = require('jsonwebtoken');
app.set('jwt',jwt);


var expressSession = require('express-session');
app.use(expressSession({
	secret: 'abcdefg',
	resave: true,
	saveUninitialized: true
}));
var mongo = require('mongodb');
var swig = require('swig');
var crypto = require('crypto');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

app.use(express.static('public'));

// routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
	// obtener el token, puede ser un parámetro GET , POST o HEADER
	var token = req.body.token || req.query.token || req.headers['token'];
	if (token != null) {
		// verificar el token
		jwt.verify(token, 'secreto', function(err, infoToken) {
			if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
				res.status(403); // Forbidden
				res.json({
					acceso : false,
					error: 'Token invalido o caducado'
				});
				// También podríamos comprobar que intoToken.usuario existe
				return;

			} else {
				// dejamos correr la petición
				res.usuario = infoToken.usuario;
				next();
			}
		});

	} else {
		res.status(403); // Forbidden
		res.json({
			acceso : false,
			mensaje: 'No hay Token'
		});
	}
});
// Aplicar routerUsuarioToken
app.use("/usuarios", routerUsuarioToken);
app.use("/mensaje", routerUsuarioToken);
app.use("/mensajes", routerUsuarioToken);

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
	if ( req.session.usuario ) {
	 // dejamos correr la petición
		next();
	} else {
		console.log("va a : "+req.session.destino)
		res.redirect("/login");
	}
});

// Aplicar routerUsuarioSession
app.use("/logout",routerUsuarioSession);
app.use("/users/list",routerUsuarioSession);
app.use("/friendRequests",routerUsuarioSession);
app.use("/friendsList",routerUsuarioSession);

// routerNoUsuarioSession
var routerNoUsuarioSession = express.Router();
routerNoUsuarioSession.use(function(req, res, next) {
	if ( !req.session.usuario ) {
	 // dejamos correr la petición
		next();
	} else {
		console.log("va a : "+req.session.destino)
		res.redirect("/users/list");
	}
});

// Aplicar routerUsuarioSession
app.use("/login",routerNoUsuarioSession);
app.use("/signup",routerNoUsuarioSession);


// Variables
app.set('port', 8081);
app.set('db','mongodb://admin:admin123@ds155299.mlab.com:55299/sdi2-uo245553');
app.set('clave','abcdefg');
app.set('crypto',crypto);

// Rutas/controladores por lógica
require("./routes/rhome.js")(app, swig);
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rResetBD.js")(app, gestorBD);
require("./routes/rapirest.js")(app, gestorBD);

// lanzar el servidor
app.use(function(err, req, res, next) {
	console.log("Error producido: " + err); // we log the error in our db
	if (!res.headersSent) {
		res.status(400);
		res.send("Recurso no disponible");
	}
});

app.listen(app.get('port'), function() {
	console.log("Servidor activo");
});