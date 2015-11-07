/* 
   Copyright Antoine Morin-Paulhus 2015 
   
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

var input = document.getElementById("input");
var output = document.getElementById("output");
var mathml = document.getElementById("mathml");

update();

input.onkeydown = update_soon;

MathJax.Hub.Config({
    extensions: ["toMathML.js"]
});

var last_update = new Date().getTime();
function update_soon(){
    var now = new Date().getTime();
    if(now - last_update > 300){
	last_update = now;
	update();
    }
    else{
	setTimeout(update_soon,200);
    }
}

function update(){
    output.innerHTML = "";
    var content = input.value;
    var div = MathJax.HTML.Element(
	"div",
	{},
	content
    );
    output.appendChild(div);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    MathJax.Hub.Queue(convertMathML);

}

function convertMathML(){
    var jax = MathJax.Hub.getAllJax();
    var txtmathml = "";

    for(var i = 0; i < jax.length;i++){
	getMathML(jax[i],function(content){
	    txtmathml += content + "\n\n";
	})
    }
    mathml.innerHTML = "";
    mathml.appendChild(
	document.createTextNode(txtmathml)
    );
}

/* getMathML is From MathJax's documentation */
function getMathML(jax,callback) {
    var mml;
    try {
	//
	//  Try to produce the MathML (if an asynchronous
	//     action occurs, a reset error is thrown)
	//   Otherwise we got the MathML and call the
	//     user's callback passing the MathML.
	//
	mml = jax.root.toMathML("");
    } catch(err) {
	if (!err.restart) {throw err} // an actual error
	//
	//  For a delay due to file loading
	//    call this routine again after waiting for the
	//    the asynchronous action to finish.
	//
	return MathJax.Callback.After([getMathML,jax,callback],err.restart);
    }
    //
    //  Pass the MathML to the user's callback
    MathJax.Callback(callback)(mml);
}
