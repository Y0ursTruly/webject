let fs=require('fs')
setTimeout(()=>process.exit(0),10001)
let {serve,connect,sync,desync,objToString,stringToObj}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
mainObj.m=mainObj //example object(it's cyclic too)
let slash=process.platform=="win32"?"\\":"/"
let filePath=__dirname+slash+"data.json"; //for syncing cyclic object to file

let ID=sync(mainObj,filePath,'    ') //sync attempts to save newest form of object to file location and returns the interval that it sets

setInterval(()=>mainObj.c[0]++,1500) //mainObj would be slightly edited every 500ms

let myWebject=serve(mainObj); //I would let it make it's own server since I don't have one to give it to
/*if you do already have a server, you can just pass it in through the second argument*/

//the "edit" event is never dispatched unless it is a part of an authToken
myWebject.addToken(1) //simple fix :D

//objToString turns objects into strings, stringToObj turns those strings into objects
myWebject.addListener("edit",async()=>{
  await new Promise(r=>setTimeout(r))
  //it takes a small yet real amount of time for object to be saved in file, an asyncrhonous setTimeout with 0ms works
  let syncedObj=stringToObj(fs.readFileSync(filePath))
  console.log("mainObj.c[0] ===",mainObj.c[0])
  console.log(`However, the equivalent in data.json ===`,syncedObj.c[0])
  console.log("When these values are not the same, it means desync worked >:D\n")
})

setTimeout(()=>desync(ID),6001)
