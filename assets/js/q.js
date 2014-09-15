/*
    GPL javascript library for dom manipulation and more
    Copyright (C) 2013  Antoine Morin-Paulhus

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

function hipsterLib(selector){
    if(typeof selector !== 'undefined'){
        return hipsterLib.init(selector);
    }
    return this;
}

(function($){
	
    $.init = function(selector){
	    var elements = [];
	    if (typeof selector == 'string') {
		    elements = document.querySelectorAll(selector)
	    } else if ( selector.is$ == true) {
		    elements = selector.elements
		    length = selector.length
	    } else {
		    elements[0] = selector
		    length = 1
	    }
        var instance = new this();
        instance.elements = elements;
	    return instance;
    }
    
	//Utilities
	
	$.callbacks = {};
	
	$.callbacks.callbacks = [];
	
	$.callbacks.add = function(refName,callback){
		
		if(typeof $.callbacks.callbacks[refName] === 'undefined')
			$.callbacks.callbacks[refName] = []
			
		$.callbacks.callbacks[refName].push(callback)
	}
	
	$.callbacks.execute = function(refName){
		
		if(typeof $.callbacks.callbacks[refName] === 'undefined')
			return
			
		for(var i = 0; i < $.callbacks.callbacks[refName].length; i++){
			$.callbacks.callbacks[refName][i]()
		}
	}
	
	$.ready = function(callback){
		if(typeof callback === 'undefined'){
			$.callbacks.execute("domready")
		}
		else{
			$.callbacks.add("domready",callback)
		}
	}
	
	$.inArray = function(a,obj){
		return (a.indexOf(obj) === -1)?false:true;
	}
	
	hipsterLib = $;
	
})(hipsterLib);

(function($){
	/*[dom]*/
	
	rootElement = document
    
	//Selectors
	
	$.fn = hipsterLib.prototype;
    
	$.fn.find = function (selector){
		var rootElement = this.elements[0] || document.body ;
		console.log(rootElement);
        var ret = $(this)
        
		ret.element = null;
		ret.elements = [];
		
		if(typeof selector == 'string')
			ret.elements = rootElement.querySelectorAll(selector)
			
		return ret
	}
	
	
	//Manipulate
	
	$.fn.before = function(content){
		var $ = this
		
		if(typeof(content) == "string"){
			content = $.utils.HTMLStringToFragment(content)
		}
		$.each(function(){
			rootElement.body.insertBefore(content, $.element)
		})
		
		return $
	}

	$.fn.after = function(content){
		var $ = this;
		
		if(typeof(content) == "string"){
			content = $.utils.html(content)
		}
		$.each(function(){
			$.element.
				parentNode.
					insertBefore( 	
									content,	
									$.element.nextSibling 
								);
		});
		
		return $;
	}

	$.fn.append = function(content){
        if(typeof content === 'undefined')
			return this;
		if(typeof content === "string"){
			content = this.toHTML(content)
		}
		var $ = this;
		$.each(function(){
			$.element.appendChild(content)
		})
		
		return $;
	}

	$.fn.prepend = function(content){
		var $ = this;
		
		if(typeof(content) == "string"){
			content = $.utils.html(content)
		}
		
		$.each(function(){
			if($.element.firstChild){
				$.element.insertBefore(content,$.element.firstChild)
			}
			else{
				$.element.appendChild(content)
			}
		});
		
		return $;
	}

	$.fn.remove = function(){
		var $ = this;
		
		$.each(function(){
			$.element.parentNode.removeChild($.element)
		})
		
		return $
	}
	
	$.fn.clear = function (){
		var $ = this
		
		$.each(function(){
			this.element.innerHTML = ''
		})
		
		return $
	}
	
	$.fn.text = function(newText){
		var $ = this;
		
		if(typeof newText === 'undefined'){
			var text = "";
			$.each(function(){
				text += $.element.textContent
			})
			
			return text
		}
		else{
			$.each(function(){
				$.element.textContent = newText
			})
		}
		
		return $;
	}
	
	$.fn.html = function(newHtml){
		var $ = this;
		
		if(typeof newHtml === 'undefined'){
			var html = "";
			$.each(function(){
				html += $.element.innerHTML
			})
			
			return html
		}
		else{
			$.each(function(){
				$.element.innerHTML = newHtml
				$.element.innerHTML = newHtml
			})
		}
		
		return $;
	}
	
	//classes
	
	$.fn.addClass = function(className){
		var $ = this;
		
		$.each(function(){
			$.element.classList.add(className)
		});
		return $;
	}
	
	$.fn.removeClass = function(className){
		var $ = this;
		
		$.each(function(){
			$.element.classList.remove(className)
		});
		return $;
	}
	
	$.fn.toggleClass = function(className){
		var $ = this;
		
		$.each(function(){
			$.element.classList.toggle(className)
		});

		return $;
	}
	
	$.fn.hasClass = function(className){
		return this.elements[0].classList.contains(className)
	}
	
	//Events
	
	$.fn.on = function(eventType,callback){
		var $ = this;
		
		$.each(function(){
			callback.bind(hipsterLib($.element))
            $.element.addEventListener(eventType,callback);
		});
		
		return $;
	}

	$.fn.one = function(eventType,callback){
		var $ = this;
		
		$.each(function(){
			
			var el = $.element
			
			el.addEventListener(eventType,internalEventListener);
			
			function internalEventListener(event){
				el.removeEventListener(eventType,internalEventListener)
				callback.call(el,event)
			}
		});
		
		return $;
	}
    
    $.fn.trigger = function(eventName){
        var event = new Event(eventName);
        this.each(function(){
			this.element.dispatchEvent(event);
		});

        return this;
    }

    $.fn.unbind = function(event,listener){
        var $ = this
        this.each(function(){
            $.element.removeEventListener(event,listener)
        })
        return this
    }

	//Styling
	
	$.fn.css = function(rules){
		var $ = this;

		for(rule in rules){
			$.each(function(){
				$.element.style[rule] = rules[rule]
			})			
		}

		return $;
	}
	
	$.fn.hide = function(){
		this.each(function(){
			this.attr("data-display",this.element.style.display)
			this.element.style.display = "none"
		})
		return this
	}
	
	$.fn.show = function(){
		this.each(function(){
			this.element.style.display = this.attr("data-display")
		})
		return this
	}
	
	$.fn.height = function(newHeight){
		if(typeof newHeight === 'undefined'){
			var clientHeight = this.elements[0].clientHeight
			
			return	(clientHeight != 0 ) ?
					clientHeight :
					this.elements[0].innerHeight
		}
		this.each(function(){
			if(newHeight == parseInt(newHeight)){
				newHeight += "px"
			}
			this.element.style.height = newHeight
		})
	}
	
	$.fn.width = function(newWidth){
		if(typeof newWidth === 'undefined'){
			var clientWidth = this.elements[0].clientWidth
			return	(clientWidth != 0 ) ?
					clientWidth :
					this.elements[0].innerWidth
		}
		this.each(function(){
			if(newWidth == parseInt(newWidth)){
				newWidth += "px"
			}
			this.element.style.Width = newWidth
		})
	}
	
	//Forms
	
	$.fn.val = function(value){
		if(typeof value === 'undefined'){
			if(typeof this.elements[0] === 'undefined'){
                return undefined
            }
            return this.elements[0].value
		}
		this.each(function(){
			this.element.value = value
		})
		
		return this
	}
	
    //Absolute positioning
    
    $.fn.top = function(arg){
        var $ = this
        if(typeof arg == "undefined")
            return this.elements[0].offsetTop || 0
        $.each(function(){            
            if(typeof arg == "string")
                this.element.style.top = arg
            else
                this.element.style.top = arg+"px"
        })
        return this
    }

    $.fn.left = function(arg){
        var $ = this
        if(typeof arg == "undefined")
            return this.elements[0].offsetLeft
        $.each(function(){
            if(typeof arg == "string")
                $.element.style.left = arg
            else
                $.element.style.left = arg+"px"
        })
        return this
    }
    
	//Data
	
	$.fn.attr = function(attribute,value){
		if (typeof value === 'undefined'){
			return this.elements[0].getAttribute(attribute)
		}
		else{
			this.elements[0].setAttribute(attribute,value)
			return this;
		}
	}
	
	//Merge elements with other $() instances
	
	$.fn.and = function(otherInstance){
		this.element = null
		this.elements = this.elements.concat(otherInstance.elements)
		this.length = this.elements.length
		
		return this
	}
	
	//Access dom
	
	$.fn.item = function(index){
		if(typeof this.elements[index] != 'undefined')
			return this.elements[index]
		else
			return null
	}
	
	$.fn.eq = function(index){
		if(typeof this.elements[index] != 'undefined')
			return q.d(this.elements[index])
		else
			return null
	}
	
	$.fn.parent = function(nthParent){
		var el = this.elements[0]
        
        while(nthParent--)
            el = el.parentNode

		return $(el)
	}
    	
	$.fn.first = function(){
		return $(this.elements[0])
	}

	$.fn.toHTML = function (htmlString){	
		var frag = rootElement.createDocumentFragment(),
			temp = rootElement.createElement('div')

		temp.innerHTML = htmlString;
		
		while (temp.firstChild) {
			frag.appendChild(temp.firstChild)
		}
		
		return frag;
	}
	
	$.nodeList = function(domElement){
		var fragment = rootElement.createDocumentFragment()
		fragment.appendChild(domElement);
		return fragment.childNodes;
	}
	
	$.addStyle = function (style){
		if(typeof(style) == "string"){
			var css = rootElement.createElement("style")
			css.type = "text/css"
			css.innerHTML = style
			$("head").append(css)
		}
	}
	
	$.extend = function (object,defaults){
		
		if(typeof object === 'undefined'){
			return defaults
		}
		
		for(var setting in defaults)
			if(typeof object[setting] === 'undefined')
				object[setting] = defaults[setting]
		
		return object
	}
	
    /*
      Be careful with $.each() !
      It does not work as jQuery's each method,
      $.each() iterates over selected elements
      and puts the current element in $.element 
      before calling your callback function.
      
      Examples:
      
      $("div").each(function(){
          //Here, $.element is the current div
          $.element.style.color = red
      })
      
      $("div").each(function(){
          //You can also do this
          $($.element).css({color:'red'})
      })

      $("div").each(function(){
          //You can stop iterating by returning -1
          if(thatWasEnough)
              return -1;
      })
    */
	$.fn.each = function(callback){
        if(typeof this.elements != 'undefined'){
		    for(var i = 0; i < this.elements.length; i++ ){
			    this.element = this.elements[i]
                
			    if(callback.call(this) == -1){
				    return this
			    }
		    }
        }
		return this
	}

	
	/*[/dom]*/
})(hipsterLib);

/* To do: validate that this works  */

(function($){
	$.rest = {}
	
	$.rest.data = {}
	
	$.rest.data.remoteUrl = "127.0.0.1"
	
	$.rest.put = function(path,data,url){
		url = url || $.rest.data.remoteUrl
		
	}
	
	$.rest.delete = function(path,data,url){
		url = url || $.rest.data.remoteUrl
		
	}
	
	$.ajax = function(data){
		if(typeof data.url === 'undefined')
			return "AJAX: url is undefined";
		if(typeof data.method === 'undefined')
			return "AJAX: method is undefined";
			
		var xhr = new XMLHttpRequest();
		
		xhr.open(data.method,data.url,true)
		
		xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		
		if(data.beforeSend === 'function')
			data.beforeSend(xhr)
		
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 0){
				if(typeof data.notInitialized === 'function')
					data.notInitialized(xhr)
			}
			if(xhr.readyState == 1){
				if(typeof data.setUp === 'function')
					data.setUp(xhr)
			}
			if(xhr.readyState == 2){
				if(typeof data.sent === 'function')
					data.sent(xhr)
			}
			if(xhr.readyState == 3){
				if(typeof data.inProgress === 'function')
					data.inProgress(xhr)
			}
			if(xhr.readyState == 4){
				console.log(xhr.responseText)
				if(typeof data.complete === 'function')
					data.complete(xhr)
			}
					
		}		
		xhr.send()
	}
	
})(hipsterLib);

if(typeof $ !== 'undefined'){
	hipsterLib.previous$ = $;
}

$ = hipsterLib;
