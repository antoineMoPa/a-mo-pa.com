/*
  Copyright Antoine Morin-Paulhus september 2014
  You can use, modify, distribute this file under 
  the terms of the GNU GPL found at 
  http://www.gnu.org/copyleft/gpl.html

  
  Now why don't you stop looking at 
  my code and go back to work!

*/

$ = function(selector){
    return document.querySelectorAll(selector);
};

function map(array,callback){
    for(var i = 0; i < array.length; i++){
        callback.call(array[i]);
    }
}

activateLang();

function activateLang(){
    var txts = $(".txt-content");
    
    for(var i = 0; i < txts.length; i++){
        var txt = txts[i];
        
        var txtHTML = txt.innerHTML;
        var source = txt.innerHTML;
        
        var regexp = /\[(lang-(.*))\]([^]*)\[\/\1\]/g;
        var langs = [];
        var versions = [];
        
        while(1){
            regexp.lastIndex = 0;
            var matches = regexp.exec(txtHTML);
            if(matches == null)
                break;            
            
            lang = matches[2];
            langs.push(lang);
            version = matches[3];
            versions.push(version);
           
            // Remove current text from string
            txtHTML = txtHTML.replace(matches[0],"");
        }
        
        langs.push("source");
        versions.push(source);
        
        if(langs.length > 0){
            txt.innerHTML = txtHTML;
            txt.outerHTML = buildLangSelector(langs)
                + buildVersions(versions);
            activateSwitches();
        }
        
        defaultLangMatch = 
            /lang=([a-zA-Z]*)/
            .exec(
                window.location.search
            );
             
        defaultLang = 
            defaultLangMatch != null?
            defaultLangMatch[1]:
            "source";
        
        chooseLang(defaultLang);
    }
    function buildLangSelector(langs){
        var selector = "<text-right><lang-selector>";
        for(var i in langs){
            href = window.location
                .href
                .replace(/\?.*/,"");
            href += "?lang=" + langs[i];
            selector += "<a href='"+href+"' class='btn'>"+langs[i]+"</a>";
        }
        selector += "</lang-selector></text-right>";
        return selector;
    }
    function buildVersions(versions){
        var content = "";
        for(var i in versions){
            content 
                += "<pre class='txt-content linguified-txt' "
                + "data-lang='"+langs[i]+"'>";
            content += versions[i];
            content += "</pre>";
        }
        return content;
    }
    
    function activateSwitches(){
        var switches = $("lang-switch");
        for(i in switches){
            switches[i].onclick = function(){
                lang = this.innerHTML;
                window.location.search = "?lang="+lang;
                chooseLang(lang);
            }
        }
    }
    function chooseLang(lang){
        map($(".linguified-txt"),function(){
            this.style.display = "none";
        });
        
        $(".linguified-txt[data-lang="+lang+"]")[0]
            .style
            .display = "block";
    }
}