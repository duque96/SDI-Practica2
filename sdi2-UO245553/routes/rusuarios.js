module.exports = function(app, swig, gestorBD) {
	// Función get para mostrar la vista de registro de usuario
	app.get("/signup", function(req, res) {
		var respuesta = swig.renderFile('views/bsignup.html', {});
		res.send(respuesta);
	});

	// Función post para registrar a un nuevo usuario
	app.post("/signup", function(req, res) {
		// validador de email
		var validator = require("email-validator");

		// atributos en el body del post
		var nombre = req.body.name;
		var email = req.body.email;
		var password = req.body.password;
		var confirmPassword = req.body.passwordConfirm;

		if (password != confirmPassword) {
			res.redirect("/signup?" + "mensaje=Las contraseñas no coinciden");
		}

		if (!validator.validate(email)) {
			res.redirect("/signup?mensaje=El "
					+ "formato del email es incorrecto");
		}

		var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
				.update(password).digest('hex');

		var usuario = {
			nombre : nombre,
			email : email,
			password : seguro
		};

		var criterio = {
			"email" : email
		};

		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				gestorBD.insertarUsuario(usuario, function(id) {
					if (id == null) {
						res.redirect("/signup?mensaje=Error "
								+ "al registrar usuario");
					} else {
						res.redirect("/login?mensaje=Nuevo "
								+ "usuario registrado");
					}
				});
			} else {
				res.redirect("/signup?mensaje=Ya existe "
						+ "un usuario con ese email");
			}
		});
	});

	// Función get para mostrar la vista de inicio de sesión
	app.get("/login", function(req, res) {
		var respuesta = swig.renderFile('views/blogin.html', {});
		res.send(respuesta);
	});

	// Función post para inciar sesión
	app.post("/login", function(req, res) {
		var email = req.body.username;
		var password = req.body.password;

		var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
				.update(password).digest('hex');

		var criterio = {
			email : email,
			password : seguro
		};

		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				req.session.usuario = null;
				res.redirect("/login" + "?mensaje=Email o password incorrecto"
						+ "&tipoMensaje=alert-danger ");

			} else {
				req.session.usuario = usuarios[0].email;
				res.redirect("/users/list");
			}
		});
	});

	// Función para cerrar sesión
	app.get("/logout", function(req, res) {
		req.session.usuario = null;
		res.redirect("/login");
	});

	// Función para mostrar una lista con todos los usuarios del sistema
	app.get("/users/list", function(req, res) {
		var criterio = {};
		if (req.query.searchText != null) {
			criterio = {
				$or : [ {
					"email" : {
						$regex : ".*" + req.query.searchText + ".*"
					}
				}, {
					"nombre" : {
						$regex : ".*" + req.query.searchText + ".*"
					}
				} ]

			};
		}

		var pg = parseInt(req.query.pg);
		if (req.query.pg == null) {
			pg = 1;
		}

		gestorBD.obtenerUsuariosPg(criterio, pg, function(usuarios, total) {
			if (usuarios == null || usuarios.length == 0) {
				res.redirect("/users/list"
						+ "?mensaje=No hay usuarios para esa búsqueda"
						+ "&tipoMensaje=alert-danger");
			} else {
				var pgUltima = usuarios.length / 4;
				if (usuarios.length % 4 > 0) {
					pgUltima = pgUltima + 1;
				}

				var respuesta = swig.renderFile('views/buserslist.html', {
					"user" : req.session.usuario,
					"usuarios" : usuarios,
					"pgActual" : pg,
					"pgUltima" : pgUltima
				});
				res.send(respuesta);
			}
		});
	});
};