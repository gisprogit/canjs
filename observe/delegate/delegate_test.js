steal('funcunit/qunit','can/observe/delegate',function(){


module('jquery/lang/observe/delegate')

var matches = can.Control.prototype.delegate.matches;

test("matches", function(){
	
	equals( matches(['**'], ['foo','bar','0']) ,
		'foo.bar.0' , "everything" );
		
	equals( matches(['*.**'], ['foo']) ,
		null , "everything at least one level deep" )
	
	equals( matches(['foo','*'], ['foo','bar','0']) ,
		'foo.bar' )
	
	equals(matches(['*'], 
					['foo','bar','0']) ,
					'foo' );
					
	equals( matches([ '*', 'bar' ], 
					['foo','bar','0']) ,
					'foo.bar' )
	// - props - 
	// - returns - 'foo.bar'
})




test("delegate", 4,function(){
	
	var state = new can.Control({
		properties : {
		  prices : []
		}
	});
	var prices = state.attr('properties.prices');
	
	state.delegate("properties.prices","change", function(ev, attr, how, val, old){
		equals(attr, "0", "correct change name")
		equals(how, "add")
		equals(val[0].attr("foo"),"bar", "correct")
		ok(this === prices, "rooted element")
	});
	
	prices.push({foo: "bar"});
	
	state.undelegate();
	
})
test("delegate on add", 2, function(){
	
	var state = new can.Control({});
	
	state.delegate("foo","add", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	}).delegate("foo","remove", function(){
		ok(false,"remove should not be called")
	});
	
	state.attr("foo","bar")
	
})

test("delegate set is called on add", 2, function(){
	var state = new can.Control({});
	
	state.delegate("foo","set", function(ev, newVal){
		ok(true, "called");
		equals(newVal, "bar","got newVal")
	});
	state.attr("foo","bar")
});

test("delegate's this", 5, function(){
	var state = new can.Control({
		person : {
			name : {
				first : "justin",
				last : "meyer"
			}
		},
		prop : "foo"
	});
	var n = state.attr('person.name'),
		check
	
	// listen to person name changes
	state.delegate("person.name","set", check = function(ev, newValue, oldVal, from){
		// make sure we are getting back the person.name
		equals(this, n)
		equals(newValue, "Brian");
		equals(oldVal, "justin");
		// and how to get there
		equals(from,"first")
	});
	n.attr('first',"Brian");
	state.undelegate("person.name",'set',check)
	// stop listening
	
	// now listen to changes in prop
	state.delegate("prop","set", function(){
		equals(this, 'food');
	}); // this is weird, probably need to support direct bind ...
	
	// update the prop
	state.attr('prop','food')
})


test("delegate on deep properties with *", function(){
	var state = new can.Control({
		person : {
			name : {
				first : "justin",
				last : "meyer"
			}
		}
	});
	
	state.delegate("person","set", function(ev, newVal, oldVal, attr){
		equals(this, state.attr('person'), "this is set right")
		equals(attr, "name.first")
	});
	state.attr("person.name.first","brian")
});

test("compound sets", function(){
	
	var state = new can.Control({
		type : "person",
		id: "5"
	});
	var count = 0;
	state.delegate("type=person id","set", function(){
		equals(state.type, "person","type is person")
		ok(state.id !== undefined, "id has value");
		count++;
	})
	
	// should trigger a change
	state.attr("id",0);
	equals(count, 1, "changing the id to 0 caused a change");
	
	// should not fire a set
	state.removeAttr("id")
	equals(count, 1, "removing the id changed nothing");
	
	state.attr("id",3)
	equals(count, 2, "adding an id calls callback");
	
	state.attr("type","peter")
	equals(count, 2, "changing the type does not fire callback");
	
	state.removeAttr("type");
	state.removeAttr("id");
	
	equals(count, 2, "");
	
	state.attr({
		type : "person",
		id: "5"
	});
	
	equals(count, 3, "setting person and id only fires 1 event");
	
	state.removeAttr("type");
	state.removeAttr("id");
	
	state.attr({
		type : "person"
	});
	equals(count, 3, "setting person does not fire anything");
})

});