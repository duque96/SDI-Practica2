module.exports = function(app, gestorBD) {
	app.post("/usuario", function(req, res) {
		var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
				.update(req.body.password).digest('hex');
		var criterio = {
			email : req.body.email,
			password : seguro
		}

		gestorBD.obtenerUsuarios(criterio, function(usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				console.log("Error de inicio de sesión en /usuario");
				res.status(401); // Unauthorized
				res.json({
					autenticado : false
				});

			} else {
				var token = app.get('jwt').sign({
					usuario : criterio.email,
					tiempo : Date.now() / 1000
				}, "secreto");
				res.status(200);
				res.json({
					autenticado : true,
					token : token,
					email : criterio.email
				});
			}
		});
	});

	app.post("/usuarios", function(req, res) {
		var email = res.usuario;

		var searchText = req.body.searchText;

		if (searchText == "") {
			var criterio = {
				"sender.email" : email,
				"status" : "FRIEND"
			};
		} else {
			var criterio = {
				"sender.email" : email,
				"recipient.email" : {
					$regex : ".*" + searchText + ".*"
				},
				"status" : "FRIEND"
			};
		}

		gestorBD.obtenerRelaciones(criterio, function(relaciones) {
			if (relaciones == null) {
				console.log("Error al cargar la lista de amigos para "
						+ req.session.usuario);
				res.status(500);
				res.json({
					error : "se ha producido un error"
				});

			} else {
				console.log("Se ha cargado la lista de amigos para "
						+ res.usuario);
				res.status(200);
				res.send(JSON.stringify(relaciones));
			}
		});
	});

	app.post("/mensaje", function(req, res) {
		var emailSession = res.usuario;
		var idRecipient = req.body.id;

		var criterioAmistad = {
			"sender.email" : emailSession,
			"status" : "FRIEND",
			"recipient._id" : gestorBD.mongo.ObjectID(idRecipient)
		};

		gestorBD.obtenerRelaciones(criterioAmistad, function(relaciones) {
			if (relaciones == null) {
				console.log("Error al cargar la lista de amigos para "
						+ req.session.usuario);
				res.status(500);
				res.json({
					error : "se ha producido un error"
				});

			} else {
				if (relaciones.length == 0) {
					console.log("No son amigos " + req.session.usuario + " y "
							+ idRecipient);
					res.status(500);
					res.json({
						"mensaje" : "No son amigos",
					});
				} else {
					if (req.body.texto != "") {
						var mensaje = {
							"emisor" : relaciones[0].sender,
							"destino" : relaciones[0].recipient,
							"texto" : req.body.texto,
							"leido" : false
						};

						gestorBD.crearMensaje(mensaje, function(result) {
							if (result == null) {
								res.status(500);
								res.json({
									error : "Error al crear el mensaje",
								});
							} else {
								res.status(200);
								res.json({
									"mensaje" : "Se ha enviado el mensaje a "
											+ relaciones[0].recipient.email
								});
							}
						});
					}
				}
			}
		});
	});

	app.get("/mensajes/:id", function(req, res) {
		var emailSession = res.usuario;
		var idUser = gestorBD.mongo.ObjectID(req.params.id);

		var criterio = {
			$or : [ {
				"emisor.email" : emailSession,
				"destino._id" : idUser
			}, {
				"emisor._id" : idUser,
				"destino.email" : emailSession
			} ]
		};

		gestorBD.obtenerMensajes(criterio, function(mensajes) {
			if (mensajes == null) {
				res.status(500);
				res.json({
					error : "Error al obtener los mensajes"
				});
			} else {
				res.status(200);
				res.send(JSON.stringify(mensajes));
			}
		});
	});

	app.put("/mensaje", function(req, res) {
		var emailSession = res.usuario;
		var idUser = gestorBD.mongo.ObjectID(req.body.id);
		var criterio = {
			"destino.email" : emailSession,
			"emisor._id" : idUser,
			"leido" : false
		};

		var atributos = {
			"leido" : true
		};

		gestorBD.actualizarMensaje(criterio, atributos, function(result) {
			if (result == null) {
				res.status(500);
				res.json({
					error : "Error al actualizar el estado de los mensajes"
				});
			} else {
				res.status(200);
				res.json({
					mensaje : "Se han marcado como leidos los mensajes de "
							+ idUser + " a " + emailSession
				});
			}
		});

	});

}