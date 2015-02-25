/* Somewhat reusable UI components and functions */

function QSA(selector){
    // shit is so long to write
    return document.querySelectorAll(selector);
}

function initInputs(inputs,callback){
    var callback = callback || function(){};
    for(input in inputs){
        var html_input = QSA("input[name="+input+"]")[0];
        if(html_input.attributes == undefined){
            continue;
        }
        enableInput(html_input, input);
    }

    function enableInput(html_input, input){
        html_input.value = inputs[input];

        /* don't change frame on arrow down! */
        html_input.onkeydown = function(e){
            e.stopPropagation();
        }

        html_input.onkeyup =
            html_input.onchange = function(){
                inputs[input] = this.value;
                callback();
                draw();
            }
    }
}

function initSwitches(switches, callback){
    var callback = callback || function(){};

    for(var sw in switches){
        var curr_switch = sw;
        var swit = QSA(
                "switch[name="+sw+"]"
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
   
   <action name="do_thing">Do something</action>
   
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
            var btn = QSA(
                "action[name="+actions[act][0]+"]"
            )[0];
            btn.onclick = actions[act][2];
        }
    }

    initKeyboard();
    function initKeyboard(){
        document.onkeydown = function(e){
            for(key in actions){
                str = String.fromCharCode(e.keyCode);
                /* direct numbers  */
                if(e.keyCode == actions[key][1]){
                    actions[key][2]();
                } else if (str == actions[key][1]){
                    actions[key][2]();
                }
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
            addClickToTab(tabtitles[j], j);
        }
    }

    function addClickToTab(i,index){
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
            tabs[i].style.display = "none";
        }
        title.classList.add("active");
        tabs[index].style.display = "block";
    }
}
