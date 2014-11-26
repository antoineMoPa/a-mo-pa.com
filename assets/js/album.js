
function play(){    
    var second = 44100;
    
    var tsss = instruments.drum.tsss(0.1,2,second);    
    var waveFunction = instruments.customSin();
    var notes = [];
    var noteLength = 0.1;
    
    
    function backgroundTrack(){
        var track = [];
        var songNotes = [
            [10,1],
            [14,1]
        ];
        
        for(note in songNotes){
            notes.push(
                tools.createNote(
                    tools.getFrequencyFromNote(songNotes[note][0]),
                    songNotes[note][1],
                    second,
                    waveFunction
                )
            );
        }
            
        for(var i = 0; i < songNotes.length; i++){
            var index = i;
            track = track.concat(notes[index]);
        }
        return track;
    }
    
    var track1 = backgroundTrack();
    
    var data = tools.mix([track1]);
    
    
    var wave = new RIFFWAVE(); // create the wave file
    wave.header.sampleRate = second;
    wave.header.numChannels = 1;
    wave.Make(data);
    var audio = new Audio(wave.dataURI); // create the HTML5 audio element
    
    audio.play(); // some noise
}

var tools = {};

tools.mix = function(tracks){
    var data = [];
    for(var i = 0; i < tracks.length; i++){
        var multiplier = 1/tracks.length;
        for(var j = 0; j < tracks[i].length; j++){
            data[j] = 127 + Math.round(
                127 * multiplier * tracks[i][j]
            );
        }
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

// Math function that goes to y=1 fast
// And drops down to y = 0 slowly
tools.fastInSlowOut = function (x,exponent){
    // use gnuplot to see it: 
    // f(x) = f(x)=-(2*x-1)**2+1;
    // plot [x=0:1] f((1-x)**2); 
    
    // An exponent below 1 makes music sound
    // like if it was played backwards :)
    // (because it 'reverses' the function)
    if(exponent == undefined){
        exponent = 3;
    }
    return tools.quadraticHalfCircle(
        Math.pow((1-x),exponent)
    );
}

tools.createNote = function(f,length,second,waveFunction){
    var data = new Array(length * second);
    for (var i = 0; i < length * second; i++){
        var intensity = tools.fastInSlowOut(
            i/(length*second),
            7
        );
        data[i] = intensity * waveFunction(f*(i/second));
        
    }
    return data;
}

// Math function that starts at [0,0],
// climbs to y = 1 when x = 0.5
// and goes back to y = 0 at x = 1
tools.quadraticHalfCircle = function(x){
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

instruments.drum.tsss = function(time,integrations,second){
    var length = second * time;
    var data = new Array(length);
    
    var white = [];
    
    for(var i = 0; i < length;i++){
        white[i] = Math.random();
    }
    
    var timing = 2 * Math.PI / second;
    
    var brown = tools.integrate(white,10,integrations);
    
    for(var i = 0; i < brown.length;i++){
        var f = 110 + 1 * Math.cos(i/90);
        brown[i] = parseInt(127 + 1.3 * 127 * brown[i] * Math.cos(f * timing * i) * fastDown(i/length));
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
            0.3 * Math.sin(4*Math.PI*i/precision)+
            0.1 * Math.sin(8*Math.PI*i/precision)+
            0.1 * Math.sin(16*Math.PI*i/precision);
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

