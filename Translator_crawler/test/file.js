fs=require('fs');
fs.open('P:/temp/temp.txt','a',function(err, fd){
    if(err){
        console.error(err);
        return;
    }
    fs.write(fd,'hello',function(err, written, string){

    });
});