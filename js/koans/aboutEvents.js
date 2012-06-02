describe('About Backbone.Events', function() {
    
    var obj = {};
    _.extend(obj, Backbone.Events);
    
    beforeEach(function() {
        obj.unbind(); // remove all custom events before each spec is run.
    });
    
    it('Any regular javascript object can be extended with custom event functionality.', function() {
        var basicObject = {};
        
        // How would you get these Backbone.Events functions added to basicObject?
        // Hint: http://documentcloud.github.com/backbone/#Events
        _.extend(basicObject, Backbone.Events);
        
        expect(typeof basicObject.bind).toEqual('function');
        expect(typeof basicObject.unbind).toEqual('function');
        expect(typeof basicObject.trigger).toEqual('function');
    });
    
    it('Events allows us to bind and trigger custom named events on an object.', function() {
        var callback = jasmine.createSpy('-custom event callback-');
        
        obj.bind('basic_event', callback);
        
        // How would you cause the callback for this custom event to be called?
        obj.trigger('basic_event');
        
        expect(callback).toHaveBeenCalled();
    });
    
    it('Events allows us to trigger more than one event at the same time.', function() {
        var callback = jasmine.createSpy('-custom event callback-');
        
        // You can bind an object to two events at the same time separating them with spaces
        obj.bind('an_event another_event', callback);
        
        // How would you change the trigger call to trigger two events at the same time?
        obj.trigger('an_event another_event');
        
        expect(callback.callCount).toBe(2);
    });
    
    it('Triggered events pass along any arguments to the callback.', function() {
        var callback = jasmine.createSpy('-custom event callback-');
        
        obj.bind('some_event', callback);
        
        obj.trigger('some_event', 'arg1', 'arg2');
        
        expect(callback.mostRecentCall.args).toEqual(['arg1', 'arg2']);
    });
    
    it('Bound events can also pass a specific context to the event callback.', function() {
        var foo = { color: 'blue' };
        
        var changeColor = function() {
            this.color = 'red';
        }
        
        /***
         * Does refering to 'this' from within an anonymous function seem foreign to you?
         * No idea what 'context' refers to when talking about javascript?
         * Here's a some reading that can help clarify things:
         * http://javascriptweblog.wordpress.com/2010/08/30/understanding-javascripts-this/
         *
         * Now, back to the koans ...
         ***/
        
        // How would you get 'this.color' to refer to 'foo' in the changeColor function?
        
        obj.bind('an_event', changeColor, foo);
        
        obj.trigger('an_event');
        
        expect(foo.color).toEqual('red');
    });
    
    it("Evented objects can bind 'all' as a special event name to capture all triggered events on the object.", function() {
        var callback = jasmine.createSpy('-custom event callback-');
        
        obj.bind('all', callback);
        
        // How are you going to call obj.trigger to get both expectations passing?
        // LEARN MORE: https://github.com/pivotal/jasmine/wiki/Spies
        obj.trigger('custom_event');
        
        expect(callback.callCount).toBe(1);
        expect(callback.mostRecentCall.args[0]).toBe('custom_event');
    });
    
    it('Evented objects can also have their named events removed.', function() {
        var spy1 = jasmine.createSpy('-spy 1-');
        var spy2 = jasmine.createSpy('-spy 2-');
        var spy3 = jasmine.createSpy('-spy 3-');
         
        obj.bind('foo_event', spy1);
        obj.bind('foo_event', spy2);
        obj.bind('foo_event', spy3);
        obj.bind('bar_event', spy1);
        
        // How do you unbind just a single callback for the event?
        obj.unbind('foo_event', spy1);
        
        obj.trigger('foo_event');
        
        expect(spy1).not.toHaveBeenCalled();
        
        // How do you unbind all callbacks tied to the event with a single method?
        obj.unbind('foo_event');
        
        obj.trigger('foo_event');
        
        expect(spy2.callCount).toEqual(1);
        expect(spy3.callCount).toEqual(1);
        
        // How do you unbind all callbacks and events tied to the object with a single method?
        obj.unbind();
        
        obj.trigger('bar_event');
        
        expect(spy1).not.toHaveBeenCalled();
    });
    
});
