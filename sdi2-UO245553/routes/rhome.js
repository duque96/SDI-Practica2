module.exports = function(app, swig) {
	app.get("/", function(req, res) {
		var respuesta = swig.renderFile('views/bindex.html', {
			"user" : req.session.usuario
		});
		res.send(respuesta);
	});
};