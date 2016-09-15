var parser = {};

/* patterns must check if the begining of 
   a string matches something */
var tokens = [
    [/^[ \n\t]+/    , "whitespace"],
    [/^\+{1,1}/     , "plus"],
    [/^\-{1,1}/     , "minus"],
    [/^[0-9]+/      , "number"],
];

str = "1 + 134 + 1 + meow";
var ts = tokenize(str);

for(var t in ts){
    console.log(ts[t]);
}

function Token(id, str){
    this.id = id;
    this.str = str;
}

function tokenize(str){
    var tokens_return = [];
    var original_str = str;
    
    while(str != ""){
	var current_end = 0;
	var token_found = false;
	
	// Find out if string matches one token
	for(var t = 0; t < tokens.length; t++){
	    var curr_tok = tokens[t];
	    
	    if(window.count > 100){
		return;
	    }
	    window.count = window.count || 0;
	    window.count++;
	    
	    if(curr_tok[0].test(str)){
		token_found = true;
		var substr;
		var match = str.match(curr_tok[0])[0];
		current_end += match.length;

		// Create token with id and value
		tokens_return.push(new Token(curr_tok[1], match));

		
		str = str.substr(current_end, str.length - current_end);
		
		// Since we found a token, it is no other token
		break;
	    }
	}

	if(!token_found){
	    // If we reach here, no token corresponds
	    // to begining of string
	    console.error("Token not recognized: " + str.substring(0,30));
	    break;
	}
    }

    return tokens_return;
}

function syntaxtree(tokens){
}
