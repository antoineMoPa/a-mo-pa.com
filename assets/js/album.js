
function play(){
    var tracks = [];
    
    var melody = [
        7,0,7,0,
        0,7,0,7,
    ];
    
    var bassMelody = [
        7,0,7,0
    ];
    
    var doumdoum = [
        7,7,7,7,7,
        8,8,8,8,8,
        5,5,5,5,5,
        6,5,4,7,6
    ];
    
    var melodyNotes = [];
    var bassNotes = [];
    var doumdoumNotes = [];

    for(var i in melody){
        melodyNotes.push([tools.majorScale(melody[i],1*12),0.3]);
    }
    
    for(var i in bassMelody){
        bassNotes.push([tools.majorScale(bassMelody[i],12),4*0.3]);
    }
    
    for(var i in doumdoum){
        doumdoumNotes.push([tools.majorScale(doumdoum[i],1*12),0.15]);
    }
    
    var instrument = tools.ntt.cordInstrument();
    
    tracks[0] = tools.ntt.make(melodyNotes, instrument);
    tracks[1] = tools.ntt.make(bassNotes, instrument);
    tracks[2] = tools.ntt.make(doumdoumNotes, instrument);
    tracks[0] = tracks[0].concat(tracks[0]);
    
    //var tsss = instruments.drum.tsss(0.3,20,tools.second);   
    
    var data = tools.mix(tracks);
        
    data = data.concat(data);
    data = data.concat(data);
    
    var wave = new RIFFWAVE(); // create the wave file
    wave.header.sampleRate = tools.second;
    wave.header.numChannels = 1;
    wave.Make(data);
    var audio = new Audio(wave.dataURI); // create the HTML5 audio element
    
    audio.play(); // some noise
}

var tools = {};
tools.second = 44100;

// ntt is short for notes to track

tools.ntt = {};


tools.ntt.cordInstrument = function(){
    tween = function(x){
        return 1-Math.pow(1-x,100) - Math.pow(x,100);
    };
    waveFunction = function(i,x){
        var clip = 0.6 - (x / 8);
        
        return tools.softclip(
            0.4 * Math.cos(8 * Math.PI * i) * (1-Math.pow(x,8)) + 
                Math.cos(4 * Math.PI * i) * (1-x) + 
                Math.cos(2 * Math.PI * i) * Math.cos(1 / 1024 * 2 * Math.PI * (1 - i))
            ,-clip,clip,0.1
        );
    };
    
    return {tween: tween, waveFunction: waveFunction};
};

tools.ntt.tsss = function(){
    tween = tools.tweens.fastInSlowOut;
    
    frequencyCallback = function(i,x,note){
        return (
            (
                0.99 + 
                    0.01 * 
                    Math.sin( 
                        20000000*i/tools.second
                    )
            ) * tools.getFrequencyFromNote(songNotes[note][0])
        );
    };
    
    return {tween: tween, waveFunction: waveFunction};
}

tools.ntt.make = function(songNotes,settings){
    var track = [];
    var notes = [];
    // For a 'long' note: 
    // function(x){return 1-Math.pow(1-x,100) - Math.pow(x,100);}
    var tween = settings.tween || tools.tweens.fastInSlowOut;
    var waveFunction = settings.waveFunction || instruments.customSin();
    var frequencyCallback = settings.frequencyCallback || 
        function(i,x,note){
            return tools.getFrequencyFromNote(songNotes[note][0]);
        };
    
    for(note in songNotes){
        notes.push(
            tools.createNote(
                frequencyCallback,
                note,
                songNotes[note][1],
                waveFunction,
                tween
            )
        );
    }
    
    for(var i = 0; i < songNotes.length; i++){
        var index = i;
        track = track.concat(notes[index]);
    }
    
    return track;
}


tools.dump = function(data,start,end){
    var str = "";
    for(var i = start; i < data.length && i < end; i++){
        str += i+"\t"+data[i] + "\n"
    }
    var area = document.createElement("pre");
    area.innerHTML = str;
    document.body.appendChild(area);
}

tools.clip = function(x,min,max){
    if(x < min){
        return min
    } else if (x > max){
        return max;
    }
    return x;
}

/* softness: ex 0.1   */

tools.softclip = function(x,min,max,softness){
    if(x < min + softness){
        return -tools.softclipUP(-x,-min,softness);
    } else if (x > max - softness){
        return tools.softclipUP(x,max,softness);
    }
    return x;
}

tools.softclipUP = function(point,max,softness){
    var limit = max - softness;
    var y = point - limit;
    var fraction = (y / (1 - limit));
    // Gnuplot to see blendfactor actually does something:
    // plot [x=0:1] [y=0:1] 1.2 - x**1.2,1.2-x
    var blendfactor = 1.01 - Math.pow(fraction,1.01);

    return (blendfactor * (fraction * softness + limit)) + ((1 - blendfactor) * max);
}

tools.repeat = function(arr,times,pushOrConcat){
    var data = [];
    for(var i = 0; i < times; i++){
        if(pushOrConcat == "push"){
            data.push(arr);
        } else if (pushOrConcat == "concat"){
            data = data.concat(arr);
        } else {
            console.log(
                "error, parameter pushOrConcat "+
                    "must be 'push' or 'concat'"
            );
        }
    }
    return data;
}

tools.mix = function(tracks){
    var data = [];
    
    for(var i = 0; i < tracks.length; i++){
        var multiplier = 1/tracks.length;
        for(var j = 0; j < tracks[i].length; j++){
            if(data[j] == undefined){
                data[j] = 0;
            }
            if(tracks[i][j] != undefined){
                data[j] += multiplier * tracks[i][j];
            }
        }
    }
    
    for(var i = 0; i < data.length; i++){
        data[i] = 127 + Math.round(
            127 * data[i]
        );
    }

    return data;
}

var baseNotes = [
    16.352,
    17.324,
    18.354,
    19.445,
    20.602,
    21.827,
    23.125,
    24.500,
    25.957,
    27.500,
    29.135,
    30.868
];

tools.noteToScale = function(i,baseNote,scale){
    if(i < 0){
        return -1;
    }
    var octaveOffset = baseNote + Math.floor( i / scale.length) * 12;
    return scale[Math.abs(i) % scale.length] + octaveOffset;
}

tools.majorScale = function(i,baseNote){
    return tools.noteToScale(i,baseNote,[0,2,4,5,7,9,10])
}

tools.minorScale = function(i,baseNote){
    return tools.noteToScale(i,baseNote,[0,2,3,5,7,8,11])
}


tools.getFrequencyFromNote = function(note){
    var currentNote = note % 12;
    var currentOctave = parseInt(note / 12) + 1;
    var baseFrequency = baseNotes[currentNote];
    // Based on the table on wikipedia article with title
    // 'Scientific pitch notation'
    // For each octave, we multiply base frequency
    // by 2
    var octaveMultiplier = Math.pow(2,currentOctave);
    
    return baseFrequency * octaveMultiplier;
}

tools.tweens = {};

tools.tweens.slowInFastOut = function(x,exponent){
    if(exponent == undefined){
        exponent = 2;
    }
    // Gnuplot:
    // plot [x=0:1] 1-(1-x)**2
    return 1 - Math.pow((1-x),exponent);
}

// Math function that goes to y=1 fast
// And drops down to y = 0 slowly
tools.tweens.fastInSlowOut = function(x,exponent){
    // use gnuplot to see it: 
    // f(x) = f(x)=-(2*x-1)**2+1;
    // plot [x=0:1] f((1-x)**2); 
    
    // An exponent below 1 makes music sound
    // like if it was played backwards :)
    // (because it 'reverses' the function)
    if(exponent == undefined){
        exponent = 2;
    }
    return tools.tweens.quadraticHalfCircle(
        Math.pow((1-x),exponent)
    );
}

tools.tweens.triangle = function(x,exponent){
    return Math.pow(1-x,exponent);
}

tools.createNote = function(frequencyCallback,note,length,waveFunction,tween){
    var data = new Array(parseInt(length * tools.second));
    
    for (var i = 0; i < length * tools.second; i++){
        var intensity = tween(
            i / (length*tools.second),
            7
        );
        
        var x = i / (length * tools.second);
        var f = frequencyCallback(i, x, note, length * tools.second);
        
        data[i] = intensity * waveFunction(
            f * (i / tools.second),
            x
        );
    }
    return data;
}

// Math function that starts at [0,0],
// climbs to y = 1 when x = 0.5
// and goes back to y = 0 at x = 1
tools.tweens.quadraticHalfCircle = function(x){
    // use gnuplot to see it: 
    // f(x)=-(2*x-1)**2+1
    return -Math.pow((2*x-1),2)+1;
}

tools.integrate = function(inputData,N,n){
    /*
      Integrates an array n times
      with some homemade method inspired by the tapezoidal method
      
      Method:
      (sum of the N previous and N next points)
      divided by 2*N
    */    
    var N = N || 1;
    var n = n || 1;
    var data = new Array(inputData.length);

    for(var integrations = 0; integrations < n; integrations++){
        for(var i = 0; i < inputData.length;i++){
            var integral = 0;
            for(var j = i - N; j < i + N; j++){
                /* check bounds */
                if(j < 0 || j >= inputData.length){
                    continue;
                }
                integral += inputData[j];
            }
            integral = integral / (2*N);
            data[i] = integral;
        }
        inputData = data.slice(0);
    }
    return data;
}

var instruments = {};

instruments.drum = {};

instruments.drum.tsss = function(time,integrations){
    var length = parseInt(tools.second * time);
    var data = new Array(length);
    
    var white = [];
    
    for(var i = 0; i < length;i++){
        white[i] = Math.random();
    }
    
    var timing = 2 * Math.PI / tools.second;
    
    var brown = tools.integrate(white,10,integrations);
    
    for(var i = 0; i < brown.length;i++){
        var f = 110 + 1 * Math.cos(i/90);
        brown[i] = 1.3 * brown[i] * Math.cos(f * timing * i) * fastDown(i/length);
    }
    
    function triangle(x){
        var x = x % 2;
        if(x < 1){
            return x;
        } else {
            return 2-x;
        }
    }
    
    function fastDown(x){            
        return Math.pow(1-(x),2);
    }
    
    return brown;
}

instruments.customSin = function(){
    var precision = 1000;
    var data = new Array(precision);
    for(var i = 0; i < precision; i++){
        data[i] = 
            0.5 * Math.sin(2*Math.PI*i/precision)+
            0.2 * Math.sin(4*Math.PI*i/precision)+
            0.1 * Math.sin(8*Math.PI*i/precision)+
            0.2 * Math.sin(16*Math.PI*i/precision);
    }
    
    function waveFunction(x){
        return data[parseInt(x*data.length) % data.length];
    }
    
    return waveFunction;
}

$.ready(function(){
    $("[action='play']").on("click",function(){
        console.log("generating");
        play();
        console.log("playing");
    });
});

