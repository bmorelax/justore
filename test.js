var should = require('should/as-function');
var justore = require('./index.js');
var EventEmitter = require('eventemitter3');

describe('JuStore', function () {

	var store = new justore({},'teststore');


	it('eventemitter3 working', function (done) {
		    var ee = new EventEmitter();

		ee.on('hi',function(){
			done();
		});
		ee.emit('hi');
	});

	it('Creates an empty store', function () {

		should(store).have.property('write');
		should(store).have.property('change');
		should(store.read()).have.property('size',0);
		should(store).have.property('name','teststore');
	});

	it('Can write some data', function () {

		store.write('name','wx');

		should(store.read('name')).be.exactly('wx');
	});

	it('Trigger events working', function (done) {

		store.change.on('age',function(data){

			var age = store.read('age');
			should(age).be.exactly(1);
			should(age).be.exactly(data);
			done();

		});

		store.write('age',1);
	});


	it('Trigger events working with js mutable data', function (done) {



		store.change.on('arr',function(data){

			var compareable = [1,3,5,7,9];
			var arr = store.read('arr');
			should(arr).deepEqual(compareable);
			should(arr).be.exactly(data);
			done();

		});


		store.write('arr',[1,3,5,7,9]);

	});


});
