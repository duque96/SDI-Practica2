module.exports = function(app, gestorBD) {
	app.get("/deletebd", function(req, res) {
		if (req.session.usuario) {
			req.session.usuario = null;
		}

		gestorBD.removeRelationships({}, function(result) {
			if (result == null) {
				res.redirect("/login?mensaje=Se ha producido un error interno"
						+ "&tipoMensaje=alert-danger");
			} else {
				gestorBD.removeUsers({}, function(result) {
					if (result == null) {
						res.redirect("/login?mensaje=Se ha producido "
								+ "un error interno"
								+ "&tipoMensaje=alert-danger");
					} else {
						res.redirect("/login?mensaje=Se ha borrado "
								+ "correctamente la base de datos");
					}
				});
			}
		});

	});

	app.get("/insertbd", function(req, res) {
		if (req.session.usuario) {
			req.session.usuario = null;
		}

		var usuarios = [
				{
					nombre : "Daniel",
					email : "daniel@gmail.com",
					password : app.get("crypto").createHmac('sha256',
							app.get('clave')).update("123456").digest('hex')
				},
				{
					nombre : "Pepe",
					email : "pepe@gmail.com",
					password : app.get("crypto").createHmac('sha256',
							app.get('clave')).update("123456").digest('hex')
				},
				{
					nombre : "Maria",
					email : "maria@gmail.com",
					password : app.get("crypto").createHmac('sha256',
							app.get('clave')).update("123456").digest('hex')
				},
				{
					nombre : "Raul",
					email : "raul@gmail.com",
					password : app.get("crypto").createHmac('sha256',
							app.get('clave')).update("123456").digest('hex')
				},
				{
					nombre : "Carla",
					email : "carla@gmail.com",
					password : app.get("crypto").createHmac('sha256',
							app.get('clave')).update("123456").digest('hex')
				},
				{
					nombre : "Elena",
					email : "elena@gmail.com",
					password : app.get("crypto").createHmac('sha256',
							app.get('clave')).update("123456").digest('hex')
				},
				{
					nombre : "Carlos",
					email : "elena@gmail.com",
					password : app.get("crypto").createHmac('sha256',
							app.get('clave')).update("123456").digest('hex')
				}, ];

		gestorBD.insertarUsuario(usuarios, function(result) {
			if (result == null) {
				res.redirect("/login?mensaje=Se ha producido "
						+ "un error interno" + "&tipoMensaje=alert-danger");
			} else {
				res.redirect("/login?mensaje=Se ha insetado "
						+ "correctamente los datos la base de datos");
			}
		});
	});
};