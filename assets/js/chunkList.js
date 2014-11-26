function ChunkList(){
    this.chunks = [];
    this.chunkPlays = [];
    this.second = 44100;
    this.length = this.second;
    
    return this;
}

/* returns the ID of the added chunk  */
ChunkList.prototype.add = function(chunk){
    if(chunk.isAChunk == true){
        this.chunks.push(chunk);
        return this.chunks.length -1;
    } else if (chunk.isAChunkPlay){
        this.chunkPlays.push(chunk);
        
        var id = chunk.chunkID;
        var chunkLength = this.chunks[id].data.length;
        var end = chunk.playAt + chunkLength;
        if(end > this.length){
            this.length = parseInt(end);
        }
        console.log(this.chunkPlays.length);
        return this.chunkPlays.length -1;
    } else {
        console.log("error: argument is not a chunk");
        return -1;
    }
}

// Todo: order by playAt time
ChunkList.prototype.orderChunkPlays = function(chunk){
    
}

ChunkList.prototype.getData = function(){
    var data = [];
    
    // Initialize data to 127
    for(var i = 0; i < this.length; i++){
        data[i] = 127;
    }
    
    for(var i = 0; i < this.chunkPlays.length; i++){
        var chunkID = this.chunkPlays[i].chunkID;
        var startAt = this.chunkPlays[i].playAt;
        var chunkLength = this.chunks[chunkID].data.length;
        
        for(var j = 0; j < chunkLength; j++){
            data[startAt + j] = 
                (
                    data[startAt + j] + 
                        this.chunks[chunkID].data[j]
                ) / 2;
        }
    }
    
    return data;
}

function ChunkPlay(id,playAt,settings){
    this.second = 44100;
    this.chunkID = id;
    this.isAChunkPlay = true;
    this.playAt = parseInt(playAt * this.second) || 0;
    this.settings = settings || {};
}

/* A peice of sound */
function Chunk(data){
    this.isAChunk = true;
    this.data = data;
}