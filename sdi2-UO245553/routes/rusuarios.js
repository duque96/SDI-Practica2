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

		if (password !== confirmPassword) {
			res.redirect("/signup?" + "mensaje=Las contraseñas no coinciden");
		}

		else if (!validator.validate(email)) {
			res.redirect("/signup?mensaje=El "
					+ "formato del email es incorrecto");
		} else {
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
							console.log("Error al registrar al usuario en /signup");
							res.redirect("/signup?mensaje=Error "
									+ "al registrar usuario");
						} else {
							console.log("Registrado correctamente al usuario " +
									email);
							res.redirect("/login?mensaje=Nuevo "
									+ "usuario registrado");
						}
					});
				} else {
					console.log("Email repetido " + email + " en /signup");
					res.redirect("/signup?mensaje=Ya existe "
							+ "un usuario con ese email");
				}
			});
		}
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
				console.log("Error de inicio de sesión en /login");
				req.session.usuario = null;
				res.redirect("/login" + "?mensaje=Email o contraseña incorrecta"
						+ "&tipoMensaje=alert-danger ");

			} else {
				console.log("Inicio de sesión correcto con email " + email);
				req.session.usuario = usuarios[0].email;
				res.redirect("/users/list");
			}
		});
	});

	// Función para cerrar sesión
	app.get("/logout", function(req, res) {
		console.log("Se cerró la sesión del usuario " + req.session.usuario);
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
				console.log("No hay usuarios en la bd /users/list");
				res.redirect("/users/list"
						+ "?mensaje=No hay usuarios para esa búsqueda"
						+ "&tipoMensaje=alert-danger");
			} else {
				var pgUltima = total / 4;
				if (total % 4 > 0) {
					pgUltima = pgUltima + 1;
				}

				var criterioUserSession = {
					"email" : req.session.usuario
				};

				gestorBD.obtenerUsuarios(criterioUserSession, function(usuario) {
					if (usuario == null || usuario.length == 0) {
						console.log("Error al obtener el usuario en sesión " 
								+ req.session.usuario +" /users/list");
						res.redirect("/users/list?mensaje=Se ha "
								+ "producido un error interno"
								+ "&tipoMensaje=alert-danger");
					} else {
						var sender = usuario[0];
				
						var criterioRelaciones = {
							"sender" : sender
						};
						
						gestorBD.obtenerRelaciones(criterioRelaciones,
								function(relaciones) {
							if (relaciones == null) {
								console.log("Error al obtener las relaciones " +
										"para el usuario en sesión " 
										+ req.session.usuario +" /users/list");
								res.redirect("/users/list?mensaje=Se ha "
										+ "producido un error interno"
										+ "&tipoMensaje=alert-danger");
							} else {
								for (var i = 0; i < usuarios.length; i++){
									for (var j = 0; j < relaciones.length; j++){
										if (relaciones[j].sender._id.toString() == sender._id.toString() 
												&& relaciones[j].recipient._id.toString() == usuarios[i]._id.toString()) {
											usuarios[i]['status'] = relaciones[j].status;
										}
									}
									if (usuarios[i].status == null){
										usuarios[i]['status'] = "empty";
									}
								}
								
								console.log("Se ha obtenido todas las " +
										"peticiones de amistad del usuario en sesión "
										+ req.session.usuario);
								
								var respuesta = swig.renderFile(
										'views/buserslist.html', {
											"user" : req.session.usuario,
											"usuarios" : usuarios,
											"pgActual" : pg,
											"pgUltima" : pgUltima
										});
								res.send(respuesta);
							}
						});
					}
				});
			}
		});
	});

	app.get("/addFriend/:id", function(req, res) {
		var idRecipient = gestorBD.mongo.ObjectID(req.params.id);

		var criterioSender = {
				"email" : req.session.usuario
		};

		gestorBD.obtenerUsuarios(criterioSender, function(sender) {
			if (sender == null || sender.length == 0) {
				console.log("Error al obtener al usuario sender" +
				" en /addFriend");
				res.redirect("/users/list" + "?mensaje=Se ha producido un "
						+ "error al agregar un amigo"
						+ "&tipoMensaje=alert-danger");
			} else {
				var senderUser = sender[0];
				var criterioRecipient = {
					"_id" : idRecipient	
				};
				
				gestorBD.obtenerUsuarios(criterioRecipient, function(recipient) {
					if (recipient == null || recipient.length == 0) {
						console.log("Error al obtener al usuario recipient" +
								" en /addFriend");
						res.redirect("/users/list" + "?mensaje=Se ha producido un "
								+ "error al agregar un amigo"
								+ "&tipoMensaje=alert-danger");
					} else {
						var recipientUser = recipient[0];
						var relacion = {
								"sender" : senderUser,
								"recipient" : recipientUser,
								"status" : "REQUEST"
						};
						
						gestorBD.añadirAmigo(relacion, function(id) {
							if (id == null) {
								console.log("Error al añadir amigo en /addFriend");
								res.redirect("/users/list"
										+ "?mensaje=Se ha producido un "
										+ "error al agregar un amigo"
										+ "&tipoMensaje=alert-danger");
							} else {
								console.log("Se ha registrado la amistad entre "
										+ req.session.usuario + " y " 
										+ recipientUser.email);
								res.redirect("/users/list" + "?mensaje=Se ha enviado "
										+ "la petición de amistad");
							}
						});
					}
				});				
			}
		});
	});
	
	app.get("/friendRequests", function(req, res) {
		var emailSession = req.session.usuario;
		
		var pg = parseInt(req.query.pg);
		if (req.query.pg == null) {
			pg = 1;
		}
		
		var criterioSession = {
			"recipient.email" : emailSession,
			"status" : "REQUEST"
		};
		
		gestorBD.obtenerRelacionesPg(criterioSession, pg,  function(relaciones, total) {
			if (relaciones == null) {
				console.log("Error al obtener las relaciones en /friendRequests");
				res.redirect("/friendRequests?mensaje=Se ha "
						+ "producido un error interno"
						+ "&tipoMensaje=alert-danger");
			} else {
				var pgUltima = total / 4;
				if (total % 4 > 0) {
					pgUltima = pgUltima + 1;
				}				
				
				console.log("Se han obtenido las solicitudes " +
						"de amistad para " + emailSession);
				var respuesta = swig.renderFile('views/bfriendrequests.html', {
					"user" : req.session.usuario,
					"requestList" : relaciones,
					"pgActual" : pg,
					"pgUltima" : pgUltima
				});
				
				res.send(respuesta);
			}
		});
	});
	
	app.get("/friendRequests/accept/:id", function(req, res){
		var idUser = req.params.id;
		
		var criterioRelaciones = {
			$or : [ {
				"recipient._id" : gestorBD.mongo.ObjectID(idUser),
				"sender.email" : req.session.usuario,
				"status" : "REQUEST"
			}, {
				"recipient.email" : req.session.usuario,
				"sender._id" : gestorBD.mongo.ObjectID(idUser),
				"status" : "REQUEST"
			} ]
		}
		
		gestorBD.obtenerRelaciones(criterioRelaciones, function(relaciones){
			if (relaciones == null || relaciones.length == 0){
				console.log("Error al aceptar la petición "
						+ req.session.usuario + " " + idUser);
				res.redirect("/friendRequests?mensaje=Se ha "
						+ "producido un error " 
						+ "interno al añadir al amigo"
						+ "&tipoMensaje=alert-danger");
			} else {
				
				for(var i = 0; i <relaciones.length; i++){
					relaciones[i].status = "FRIEND";
				}
			
				var criterio = {
						"sender" : relaciones[0].sender,
						"recipient" : relaciones[0].recipient,
						"status" : "REQUEST"
				}
				
				gestorBD.actualizarRelaciones(criterio, relaciones[0], function(obj){
					if (obj == null){
						console.log("Error al actualizar las relaciones");
						res.redirect("/friendRequests?mensaje=Se ha "
								+ "producido un error " 
								+ "interno al añadir al amigo"
								+ "&tipoMensaje=alert-danger");
					} else {						
						if (relaciones.length > 1) {
							criterio = {
									"sender" : relaciones[1].sender,
									"recipient" : relaciones[1].recipient,
									"status" : "REQUEST"
							}
							
							gestorBD.actualizarRelaciones(criterio, relaciones[1], function(obj){
								if (obj == null){
									console.log("Error al actualizar las relaciones");
									res.redirect("/friendRequests?mensaje=Se ha "
											+ "producido un error " 
											+ "interno al añadir al amigo"
											+ "&tipoMensaje=alert-danger");
								} else {
									console.log("Se ha aceptado la petición de amistad "
											+ "entre " + relaciones[1].sender + " y "
											+ relaciones[1].recipient);
									res.redirect("/friendRequests?mensaje=Se ha "
											+ "aceptado la petición de amistad");
								}
							});
						} else {
							var relacionAux = {
									"sender" : relaciones[0].recipient,
									"recipient" : relaciones[0].sender,
									"status" : "FRIEND"
							}
							gestorBD.añadirAmigo(relacionAux, function(id){
								if (id == null){
									console.log("Error al actualizar las relaciones");
									res.redirect("/friendRequests?mensaje=Se ha "
											+ "producido un error " 
											+ "interno al añadir al amigo"
											+ "&tipoMensaje=alert-danger");
								} else {
									console.log("Se ha aceptado la petición de amistad "
											+ "entre " + relaciones[0].sender + " y "
											+ relaciones[0].recipient);
									res.redirect("/friendRequests?mensaje=Se ha "
											+ "aceptado la petición de amistad");
								}
							});
						}
					}
				});
			}
		});
	});
	
	app.get("/friendsList", function(req, res){
		var pg = parseInt(req.query.pg);
		if (req.query.pg == null) {
			pg = 1;
		}
		
		var criterio = {
				"sender.email" : req.session.usuario,
				"status" : "FRIEND"
		};
		
		gestorBD.obtenerRelacionesPg(criterio, pg, function(relaciones, total){
			if (relaciones == null){
				console.log("Error al cargar la lista de amigos para "
						+ req.session.usuario);
				res.redirect("/users/list?mensaje=Se ha "
						+ "producido un error " 
						+ "interno al cargar la lista de amigos"
						+ "&tipoMensaje=alert-danger");
			} else {
				var pgUltima = total / 4;
				if (total % 4 > 0) {
					pgUltima = pgUltima + 1;
				}
				console.log("Se ha cargado la lista de amigos para "
						+ req.session.usuario);
				var respuesta = swig.renderFile('views/bfriendslist.html', {
					"user" : req.session.usuario,
					"friendsList" : relaciones,
					"pgActual" : pg,
					"pgUltima" : pgUltima
				});
				
				res.send(respuesta);
			}
		});
	});
};
