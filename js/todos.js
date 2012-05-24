/* global $, _, Backbone */
(function() {
    var TEMPLATE_URL = '';
    
    var NAUGHTY_WORDS = /crap|poop|hell|frogs/gi;
    
    function sanitize(str) {
        return str.replace(NAUGHTY_WORDS, 'double rainbows');
    }
    
    window.Todo = Backbone.Model.extend({

        defaults: function() {
            return {
                text: '',
                done:  false,
                order: 0
            };
        },
        
        initialize: function() {
            this.set({text: sanitize(this.get('text'))}, {silent: true});
        },
        
        validate: function(attrs) {
            if (attrs.hasOwnProperty('done') && !_.isBoolean(attrs.done)) {
                return 'Todo.done must be a boolean value.';
            }
        },

        toggle: function() {
            this.save({done: !this.get("done")});
        }

    });

    window.TodoList = Backbone.Collection.extend({

        model: Todo,
        
        url: '/todos/',

        done: function() {
            return this.filter(function(todo) { return todo.get('done'); });
        },

        remaining: function() {
            return this.without.apply(this, this.done());
        },
        
        nextOrder: function() {
            if (!this.length) { 
                return 1; 
            }
            
            return this.last().get('order') + 1;
        },

        comparator: function(todo) {
            return todo.get('order');
        }

    });

    window.TodoView = Backbone.View.extend({

        tagName:  "li",

        events: {
            "click .check"              : "toggleDone",
            "dblclick div.todo-text"    : "edit",
            "click span.todo-destroy"   : "clear",
            "keypress .todo-input"      : "updateOnEnter"
        },

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        render: function() {
            var template = _.template($('#item-template').html());
            
            this.$el.html(template(this.model.toJSON()));
            this.setText();
            
            return this;
        },

        setText: function() {
            var text = this.model.get('text');
            this.$('.todo-text').text(text);
            this.input = this.$('.todo-input');
            this.input.bind('blur', _.bind(this.close, this)).val(text);
        },

        toggleDone: function() {
            this.model.toggle();
        },

        edit: function() {
            $(this.el).addClass("editing");
            this.input.focus();
        },

        close: function() {
            this.model.save({text: this.input.val()});
            $(this.el).removeClass("editing");
        },

        updateOnEnter: function(e) {
            if (e.keyCode === 13) { this.close(); }
        },

        remove: function() {
            $(this.el).remove();
        },

        clear: function() {
            this.model.destroy();
        }

    });

    window.TodoApp = Backbone.View.extend({
        
        todos: new TodoList(),

        events: {
            "keypress #new-todo":  "createOnEnter",
            "keyup #new-todo":     "showTooltip",
            "click .todo-clear a": "clearCompleted"
        },

        initialize: function(options) {
            var template = _.template($('#app-template').html());
            var parentElt = options.appendTo || $('body');

            parentElt.append(template({}));

            this.setElement($('#todoapp'));
            this.input = this.$("#new-todo");

            this.todos.bind('add',   this.addOne, this);
            this.todos.bind('reset', this.addAll, this);
            this.todos.bind('all',   this.render, this);

            this.todos.fetch();
        },

        render: function() {
            var template = _.template($('#stats-template').html());
            
            $('#todo-stats').html(template({
                total:      this.todos.length,
                done:       this.todos.done().length,
                remaining:  this.todos.remaining().length
            }));
            
            return this;
        },

        addOne: function(todo) {
            var view = new TodoView({model: todo});
            this.$("#todo-list").append(view.render().el);
        },

        addAll: function() {
            this.todos.each(this.addOne);
        },

        createOnEnter: function(e) {
            var text = this.input.val();
            
            if (!text || e.keyCode !== 13) {
                return;
            }
            
            this.todos.create({text: text, done: false, order: this.todos.nextOrder()});
            this.input.val('');
        },

        clearCompleted: function() {
            _.each(this.todos.done(), function(todo) { todo.destroy(); });
            return false;
        },

        showTooltip: function(e) {
            var tooltip = this.$(".ui-tooltip-top");
            var val = this.input.val();
            
            tooltip.fadeOut();
            
            if (this.tooltipTimeout) { clearTimeout(this.tooltipTimeout); }
            if (val === '' || val == this.input.attr('placeholder')) { return; }
            
            var show = function() { tooltip.show().fadeIn(); };
            
            this.tooltipTimeout = _.delay(show, 1000);
        }
        
    });
    
}());
