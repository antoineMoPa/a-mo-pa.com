
function play(){
    var spectrum = tools.spectrum.buildFreqSpectrum();
    spectrum = funkyfySpectrum(spectrum);
    var second = 44100;
    
    var chunklist = new ChunkList();
    var chunk = new Chunk(createNote(140,2));
    var chunkid = chunklist.add(chunk);
    
    for(var i = 0; i < 10; i++){
        var chunkplay = new ChunkPlay(chunkid,10/i);
        var chunkPlayID = chunklist.add(chunkplay);
    }
    
    // Sample code
    // Produces a sine wave with a frequency of 220 hz (LA [A])
    var data = [];
    

    var length = 2*second;
    var PI = Math.PI;
        
    var song = [21,23,26,28,23,0,23,0];
    
    song = song.concat(song).concat(song);
    
    var noteLength = length / song.length;
    
    
    //for (var i = 0; i < length; i++){
    //    data[i] = 127 + 
    //        Math.round(
    //            127 * getWaveForI(i)
    //        );
    //}    
    
    data = chunklist.getData();

    
    function createNote(f,length){
        var data = new Array(length * second);
       
        for (var i = 0; i < length * second; i++){
            data[i] = 127 + 
                Math.round(
                    127 * getWaveForI(i,f,length * second)
                );
        }
        return data;
    }
    
    function getWaveForI(i,f,length){
        // let x be the fraction of the note that is completed
        // x = 0 means that the note just started to play
        // x = 0.99 means the note is almost over
        //var noteLength = length || noteLength;
        var length = length || noteLength;
        var currentX = (i % length);
        var maxX = length;
        var x = currentX / maxX;
        var intensity = tools.fastInSlowOut(x,7);
        var frequency = f || getNoteForI(i);
        return intensity * shape(i/second,frequency);
    }
    
    function shape(time,f){
        var timeInPeriod = time % (1/f);
        //return Math.cos(2*Math.PI*f*time);
        return tools.spectrum.noteSpecralizer(f,time,spectrum);
    }
    
    function getCurrentNote(i){
        return parseInt(i / noteLength);
    }
    
    function getNoteForI(i){
        var currentNote = getCurrentNote(i);
        var currentSongNote = song[currentNote];
        if(currentSongNote == 0){
            return 0;
        }
        return tools.getFrequencyFromNote(currentSongNote);
    }
    
    function funkyfySpectrum(spectrum){
        for(var i = 0; i < spectrum.data.length - 5; i++){
            if(spectrum.data[i] > 0.5){
                spectrum.data[i - 2] = 0.4;
                spectrum.data[i + 2] = 0.4;
            }
        }
        return spectrum;
    }
    
    var wave = new RIFFWAVE(); // create the wave file
    wave.header.sampleRate = second;
    wave.header.numChannels = 1;
    wave.Make(data);
    var audio = new Audio(wave.dataURI); // create the HTML5 audio element
    
    audio.play(); // some noise
}

var tools = {};
tools.spectrum = {};

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

// Math function that starts at [0,0],
// climbs to y = 1 when x = 0.5
// and goes back to y = 0 at x = 1
tools.quadraticHalfCircle = function(x){
    // use gnuplot to see it: 
    // f(x)=-(2*x-1)**2+1
    return -Math.pow((2*x-1),2)+1;
}

// Returns a frequency spectrum
tools.spectrum.buildFreqSpectrum = function (){
    var start = -2; // spectrum starts at the -1th harmonic
    var end = 8; // end at the 10th harmonic
    var base = 2;
    var precision = 100;
    var data = new Array(precision);
    var harmonicSpan = data.length / (end - start);
    var baseNote = (0-start) * harmonicSpan;
    
    for(var i = 0; i < data.length; i++){
        data[i] = 0;
    }
    
    data[baseNote + 0 * harmonicSpan] = 8;
    data[baseNote + 1 * harmonicSpan] = 0.2;
    data[baseNote + 2 * harmonicSpan] = 0.2;
    data[baseNote + 3 * harmonicSpan] = 0.7;
    data[baseNote + 4 * harmonicSpan] = 0.3;
    data[baseNote + 5 * harmonicSpan] = 0.5;
    data[baseNote + 6 * harmonicSpan] = 0.3;
    data[baseNote + 7 * harmonicSpan] = 0.1;
    
    //data[3*harmonicSpan] = 1;
    
    return {
        start: start,
        end: end,
        base: baseNote,
        data: data
    }
}


tools.spectrum.blurSpectrum = function (spectrum,span){
    for(var i = span; i < spectrum.data.length - span; i++){
        if(spectrum.data[i] == 0){
            continue;
        }
        for(var j = - span; j < span; j++){
                spectrum.data[i+j] = (0.1*spectrum.data[i] + 0.9*spectrum.data[i+j]);
        }
    }
    return spectrum;
}

tools.spectrum.noteSpecralizer = function (note,time,spectrum){
    
    var ths = 0;
    var result = 0;
    var harmonicsSpan = (0 - spectrum.start) + spectrum.end;
    var initialFrequency = note * Math.pow(2,spectrum.start);
    var finalFrequency = note * Math.pow(2,spectrum.end);
    var frequencySpan = finalFrequency - initialFrequency; 
    var length = spectrum.data.length;
    var base = spectrum.base;
    
    for(var i = 0; i < spectrum.data.length; i++){
        ths += spectrum.data[i];
        var f = ((i - base) / spectrum.data.length) * frequencySpan + note + initialFrequency;           
        var periodicity = 2*Math.PI*f*time;            
        
        result += spectrum.data[i] * 
            Math.sin(periodicity);
    }
    return result / ths;
}

$.ready(function(){
    $("[action='play']").on("click",function(){
        console.log("generating");
        play();
        console.log("playing");
    });
});

