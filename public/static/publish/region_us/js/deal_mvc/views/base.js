//-------------------------------------------------------
//-------------------------------------------------------
/*
ref: http://mustache.github.com/
 
Define the Mustache.js template used to display deals.  This is
basically just an HTML snippet with variables that are escaped, so that
their values can be injected into the HTML by Mustache.  Since Mustache
processes the template at render time, the variables referenced below
need to be part of the model.
 
ex. {{someVariable}}  or  {{someFunction}}
*/

/*
ref:  http://documentcloud.github.com/backbone/#View
 
"Deal" view.  A view to display a collection of deals.  This view was left generic so that it can
be used to display any deal collection that is defined.  This class extends the Backbone.View class
and inherits all of its properties/functions.  A view is just a means of displaying data on the
screen.
 
The important pieces below are the 'render' function and template that are up to you to define.
The render function relies on the fact that anything that uses the DealView class, set its template
before rendering. 
   
The render function in this instance first clears out the DOM element 'el', then loops through
a collection of deal models and appends them to the DOM element.  The html is generated using
the Mustache.js library which uses the template we define.
*/
var DealView = Backbone.View.extend({
	//Set this when instance created.  This is based on the model type.
	template: '<div>SET YOUR TEMPLATE</div>',
	errorMessage: '<div>No Deals to Display</div>',
	GDEerrorMessage: '<div style="width: 900px;height: 400px; background-position: center center; background-repeat: no-repeat; background-image: url(http://blog.stevienova.com/wp-content/uploads/LiveWriter/ClassicTechnicalDifficultiesImage_1388B/9f04_thumb.jpg);"></div>',
	minDeals: 1,
	alternateUrl: undefined,
	render: function() {      
		
		var that = this;
		//First clear out the DOM element
		$(that.el).empty();

		//For each model in the collection, append the template to the DOM element
		//If no models, return error message
		if (attemptRetry && that.alternateUrl!=undefined && this.model.models.length < that.minDeals)
		{
			attemptRetry = false;
			window.location.hash = that.alternateUrl;
		}
		else
		{
			if(this.model.models.length > 0)
			{
				attemptRetry = false;
				$.each(this.model.models,
					function(i, model) {
						$(that.el).append(Mustache.to_html(that.template,model));
					});
			}
			else {
				$(that.el).append(that.errorMessage);
			}
		}
	},
	/*
	function automatically called after all deals have rendered
	useful for post rendering hooks (onClick, mouseovers,etc) and any page style updates
	*/
	postRender: function postRender()
	{
		return this;
	},
	/*
	function automatically called before all deals have rendered
	useful for any final data validation or removing hooks/interval callouts.
	*/
	preRender: function preRender()
	{
		return this;
	},
	//Basic template to enumerate all functions with a "get" prefix and display them with populated model data.
	diagnosticTemplate: function() { 
		var html = '<div>'
		if(!this.model.model.prototype) { return 'No Prototype.'; }
		for(var key in this.model.model.prototype){
			if(key.match(/^get\w+/i)) { html += '<span name="name">'+key+'</span>:<span name="value">{{'+key+'}}</span><br>'; }
		}
		html += '</div><br>';
		return html; 
	}
});
//end base view js