var Immutable = require('immutable');var MicroEvent = require('microevent');var isPromise = require('is-promise');function justore(initData) {	var self = this;	var data = Immutable.Map(initData || {});	this.write = function (key, d) {		data = data.set(key, d);		self.trigger('key',d);		return data;	};	this.read = function(key){		return key ? data.get(key) : data;	}}MicroEvent.mixin(justore);module.exports = justore;