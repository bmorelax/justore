var Immutable = require('immutable');
var EventEmitter = require('eventemitter3');
var clone = require('lodash/lang/clone');
var nextTick = require('next-tick');

var isPromise = require('is-promise');

var Rx = require('rxjs/Rx');

function Justore(initData,storeName) {
	var self = this;

	self.name = storeName || 'Anonymous Store';

	var data = Immutable.Map(initData || {});
	var previousData = data;
	function dataSetter(key,val){
		if(key==='*'){
			if(Immutable.Map.isMap(val)){
				data = val;
			}else{
				throw new TypeError('* setter must be a ImmutableJS data map');
			}
		}else{
			data = data.set(key,val)
		}
		return data;
	}

	function dataGetter(key){
		if(key === undefined || key==='*'){
			return data;
		}else{
			return data.get(key)
		}
	}


	self.asyncEvents = false;

	function emit(){
		var args = arguments;
		if(self.asyncEvents){
			nextTick(function(){
				self.change.emit.apply(self.change,args);
			})
		}else{
			self.change.emit.apply(self.change,args);
		}

	}

	function triggerChange(forceTriggerKey){

		var changed = [];

		data.forEach(function(itemData,key){
			var prevItemData = previousData.get(key);

			if(forceTriggerKey === key || itemData !== prevItemData){

				emit(key,itemData,prevItemData);
				changed.push(key);
				return false;
			}
		});
		if(changed.length) {
			emit('*', changed);
		}
	}


	function updatePreviousData(){
		previousData = data;
	}





	this.lock = false;

	this.writeObservable = Rx.Observable.create(function (ob) {
		self.write = function (key, d, opt) {
			self.lock = true;
			dataSetter(key,d);
			ob.next({key:key,d:d,opt:opt});
		}
	})
	
	this.writeObservable
		.groupBy(val => val.key)
		.subscribe(function (g) {
			return g
				.debounceTime(0)
				// .filter(function (valArr) {
				// 	debugger;
				// 	return valArr.length > 0;
				// })
				// .map(valArr => valArr[valArr.length-1])
				.subscribe(function (val) {
					console.log(val);
					return val;
				})
		})
		




	// this.write = function (key, d, opt) {
	// 	var opt = opt || {};
	// 	var mute = opt.mute;
	//
	// 	function triggerHandler(d){
	// 		if(!mute){triggerChange()}
	// 		return d;
	// 	}
	//
	// 	function triggerReject(reson){
	// 		emit('Error:'+key,reson);
	// 		console.warn('Justore write '+ self.name +' Error: ',reson);
     //        return Promise.reject(reson);
	// 	}
	//
	// 	var setData = function(d){
	//
	// 		dataSetter(key,d);
	// 		triggerHandler(data);
	// 		updatePreviousData();
	// 		return Promise.resolve(data);
	// 	};
	//
	// 	return setData(d)
	// 		['catch'](triggerReject)
	//
	//
	//
	// };

	self.trigger = function(key){
		triggerChange(key);
	};

	self.read = function(key){
		return dataGetter(key);
	};



	self.readAsClone = function(key,isDeep){
		var isDeep = typeof(isDeep) === 'boolean' ? isDeep : true;
		var ret = self.read(key);
		if(!Immutable.Map.isMap(ret)){
			ret = clone(ret,isDeep);
		}
		return ret;
	}


	self.change = new EventEmitter();



};

Justore.prototype.createReactMixin = function(key){
	var self = this;
	return {
		componentWillMount: function(){
			var comp = this;
			self.change.on(key,comp.onStoreChange);
		},
		componentWillUnmount:function(){
			var comp = this;
			self.change.removeListener(key,comp.onStoreChange);
		}
	}
};




module.exports = Justore;
