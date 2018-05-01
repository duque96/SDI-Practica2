module.exports = {
	mongo : null,
	app : null,
	init : function(app, mongo) {
		this.mongo = mongo;
		this.app = app;
	},
	removeUsers : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('usuarios');
				collection.remove(criterio, function(err, obj) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(obj.result.n);
					}
					db.close();
				});
			}
		});
	},
	removeRelationships : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('relaciones');
				collection.remove(criterio, function(err, obj) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(obj.result.n);
					}
					db.close();
				});
			}
		});
	},
	insertarUsuario : function(usuario, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('usuarios');
				collection.insert(usuario, function(err, result) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(result.ops[0]._id);
					}
					db.close();
				});
			}
		});
	},
	obtenerUsuarios : function(criterio, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('usuarios');
				collection.find(criterio).toArray(function(err, usuarios) {
					if (err) {
						funcionCallback(null);
					} else {
						funcionCallback(usuarios);
					}
					db.close();
				});
			}
		});
	},
	obtenerUsuariosPg : function(criterio, pg, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('usuarios');
				collection.count(function(err, count) {
					collection.find(criterio).skip((pg - 1) * 6).limit(6)
							.toArray(function(err, usuarios) {
								if (err) {
									funcionCallback(null);
								} else {
									funcionCallback(usuarios, count);
								}
								db.close();
							});
				});
			}
		});
	},
	añadirAmigo : function(relacion, functionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				functionCallback(null);
			} else {
				var collection = db.collection("relaciones");
				collection.insert(relacion, function(err, result) {
					if (err) {
						functionCallback(null);
					} else {
						functionCallback(result.ops[0]._id);
					}
					db.close();
				});
			}
		});
	},
	obtenerRelaciones : function(criterio, functionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				functionCallback(null);
			} else {
				var collection = db.collection("relaciones");
				collection.find(criterio).toArray(function(err, relaciones) {
					if (err) {
						functionCallback(null);
					} else {
						functionCallback(relaciones);
					}
					db.close();
				});
			}
		});
	},
	obtenerRelacionesPg : function(criterio, pg, funcionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				funcionCallback(null);
			} else {
				var collection = db.collection('relaciones');
				collection.count(function(err, count) {
					collection.find(criterio).skip((pg - 1) * 6).limit(6)
							.toArray(function(err, relaciones) {
								if (err) {
									funcionCallback(null);
								} else {
									funcionCallback(relaciones, count);
								}
								db.close();
							});
				});
			}
		});
	},
	actualizarRelaciones : function(criterio, relacion, functionCallback) {
		this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
			if (err) {
				functionCallback(null);
			} else {
				var collection = db.collection("relaciones");
				collection.update(criterio, relacion, function(err, obj) {
					if (err) {
						functionCallback(null);
					} else {
						functionCallback(obj);
					}
					db.close();
				});
			}
		});
	},
};