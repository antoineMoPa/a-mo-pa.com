// (c) 2015 Antoine Morin-Paulhus
// You can use this file under the terms of the
// GNU GPL v3 or later
// http://www.gnu.org/copyleft/gpl.html

var titles = document.querySelectorAll("h1,h2,h3");

for(var i = 0; i < titles.length; i++){
    init_title(titles[i]);
}

function init_title(title){
    var vals = title.innerHTML.split("|");
    var current = 0;
    change_title();
    
    function change_title(){
        title.innerHTML = vals[current % vals.length];
        current++;
    }
    
    setInterval(change_title,Math.random()*1000+1000);
}

