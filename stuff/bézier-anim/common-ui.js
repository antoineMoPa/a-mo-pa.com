/* Somewhat reusable UI components and functions */

function QSA(selector){
    // shit is so long to write
    return document.querySelectorAll(selector);
}


init_keyboard();

var formlists = -1;

/**

   May be deleted soom

   uses html like this:

   <list data-name="images">
   <element>
       <h4>Image {{id}}<h4>
       <label>url</label>
       <br>
       <input data-id="{{id}}" data-name="image_url">
   </element>
   <br>
   </list>

   and js like that:

   initFormList("images",
             animations[current_animation].images,
             update_images);


*/

function initFormLists(){
    var html_lists = QSA("list");
    formlists = {};
    for(var el in html_lists){
        var html_list = html_lists[el]
        if(html_list.attributes == undefined){
            continue;
        }
        formlists[html_list.getAttribute("data-name")] = {
            node: html_list,
            template: html_list.innerHTML,
        };
    }
}

function initFormList(name, data, callback){
    if(formlists == -1){
        initFormLists();
    }
    var html = "";
    var list = formlists[name];
    for(var i = 0; i < data.length; i++){
        var reg = RegExp("\{\{id\}\}","gi");
        var tmpl = list.template.replace(reg,i);
        html += tmpl;
    }
    list.node.innerHTML = html;

    for(var i = 0; i < data.length; i++){
        var inputs = data[i];
        for(var index in inputs){
            var sel = "input[data-name='"+index+"'][data-id='"+i+"']";
            var html_input = QSA(sel)[0];
            enableInput(
                html_input,
                inputs,
                index,
                callback
            );
        }
    }
}

function initInputs(inputs, callback){
    var callback = callback || function(){};
    for(input in inputs){
        var html_input = QSA(
            "input[data-name="+input+"]"
        )[0];
        enableInput(
            html_input,
            inputs,
            input,
            callback
        );
    }
}

function enableInput(html_input, data_array, index, callback){
    var callback = callback || {};
    var type = html_input.type;

    if( type == "file"
        && html_input.className.indexOf("image") != -1 ){
        html_input.onchange = function(e){
            var file = e.target.files[0];
            var id = file.name + file.lastModified;
            var reader = new FileReader();
            data_array[index+"_id"] = id;
            reader.onload = function(e){
                store_image(id,e.target.result);
            };
            reader.readAsDataURL(file);
            callback(
                html_input,
                data_array,
                index
            );
        }
    } else {
        html_input.value = data_array[index];
        /* don't change frame on arrow down! */
        html_input.onkeydown = function(e){
            e.stopPropagation();
        }

        html_input.onkeyup =
            html_input.onchange = function(){
                oldvalue = this.value;
                data_array[index] = this.value;

                callback(
                    html_input,
                    data_array,
                    index,
                    oldvalue
                );
            }
    }
}

/* Store image in animation */
function store_image(id,data){
    if(image_store[id] == undefined){
        image_store[id] = {};
        image_store[id].data = data;
        cache_image(id, data);
    }
}

/* create dom image element usable by canvas
   for this session */
var image_cache = [];
function cache_image(id,data){
    if( image_cache[id] == undefined && data != undefined ){
        var image = new Image();
        image.src = data;
        image.onload = draw;
        image_cache[id] = image;
    }
}

/* cache all images in image store */
function fetch_images(){
    for(image in image_store){
        cache_image(
            image,
            image_store[image].data
        );
    }
}

function initSwitches(switches, callback){
    var callback = callback || function(){};

    for(var sw in switches){
        var curr_switch = sw;
        var swit = QSA(
                "switch[data-name="+sw+"]"
            )[0];

        var options = swit.children;
        for(var option in options){
            if(options[option].attributes == undefined){
                continue;
            }
            options[option].classList.remove("active");
            enableSwitch(curr_switch, options, option);
        }
    }
    function enableSwitch(curr_switch, options, option){
        var value = options[option]
            .attributes
            .getNamedItem("data-value")
            .value;

        if(value == switches[curr_switch]){
            options[option].classList.add("active");
        }

        options[option].onclick = function(){
            for(var opt in options){
                if(options[opt].classList == undefined){
                    continue;
                }
                options[opt].classList.remove("active");
            }
            options[option].classList.add("active");
            switches[curr_switch] = value;
            callback();
            draw();
        }
    }
}

/**
   Takes an array, assings keyboard shortcuts
   and binds button clicks

   action buttons should be like that:

   <action data-name="do_thing">Do something</action>

   array should look like that:

   [
   ["do_thing",<an uppercase letter>,<a callback>]
   ]

   ex:

   [
   ["animation_play","P",action_animation_play],
   ["animation_clear","",action_animation_clear], // no shortcut for this one
   ["","s",action_animation_save],  // no button for this one
   ]

*/
function initActions(actions){
    for(var act = 0; act < actions.length; act++){
        if(actions[act][0] != ""){
            var btns = QSA(
                "action[data-name="+actions[act][0]+"]"
            );
            
            for(var i = 0; i < btns.length; i++){
                btn = btns[i];
                btn.onclick = actions[act][2];
            }
        }
    }

    window.keyboard.callbacks.push(function(e){
        for(key in actions){
            str = String.fromCharCode(e.keyCode);
            /* direct numbers  */
            if(e.keyCode == actions[key][1]){
                actions[key][2]();
            } else if (str == actions[key][1]){
                actions[key][2]();
            }
        }
    });
}

function init_keyboard(){
    window.keyboard = {};
    keyboard.callbacks = [];
    window.listened_keys = {};

    window.listen_key = function(key){
        if(!(key in listened_keys)){
            listened_keys[key] = false;
        }
    };

    document.onkeydown = function(e){
        str = String.fromCharCode(e.keyCode);
        for(var callback in keyboard.callbacks){
            keyboard.callbacks[callback](e);
        }
        set_current_key(e,true);
    };

    document.onkeyup = function(e){
        set_current_key(e,false);
    };

    function set_current_key(e, value){
        str = String.fromCharCode(e.keyCode);
        for(var key in listened_keys){
            if(e.keyCode == key){
                listened_keys[key] = value;
            } else if (str == key){
                listened_keys[key] = value;
            }
        }
    }

}


/**
    damn simple tab ui

    activates dom like that:

    <tabtitles>
      <tabtitle class="text-center">
        DRAWING
      </tabtitle>
      <tabtitle class="text-center">
        OBJECT
      </tabtitle>
    </tabtitles>
    <tabs>
      <tab>
        Some content
      </tab>
      <tab>
        Some content
      </tab>
    </tabs>
*/

function initTabs(){
    var alltitles = QSA("tabtitles");
    for(var i = 0; i < alltitles.length; i++){
        var tabtitles = alltitles[i].children;
        switchTo(tabtitles[0], 0);
        for(var j = 0; j < tabtitles.length; j++){
            enableTab(tabtitles[j], j);
        }
    }

    function enableTab(i,index){
        i.switch_to_this =
            i.onclick = function(){
                switchTo(i,index);
            }
    }
    function switchTo(title,index){
        var tabs = title
            .parentNode
            .parentNode
            .getElementsByTagName("tabs")[0].children;

        var tabtitles = title.parentNode.children;

        for(var i = 0; i < tabtitles.length; i++){
            tabtitles[i].classList.remove("active");
            tabs[i].classList.remove("active");
        }
        title.classList.add("active");
        tabs[index].classList.add("active");
    }
}
