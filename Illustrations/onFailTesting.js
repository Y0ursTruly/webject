setTimeout(()=>process.exit(0),20001)
let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
mainObj.m=mainObj //example object(it's cyclic too)

let myWebject=serve(mainObj)
myWebject.addToken(1,mainObj,'valid_authToken')
myWebject.addListener('connect',ev=>{
  console.log('connection made.. disconnecting...')
  setTimeout(()=>ev.client.close(),10)
})
setInterval(()=>mainObj.c[0]++,500) //edits to the object every 500ms

const mySharedObj={};
async function loop(){
  await new Promise(r=>setTimeout(r,3000)) //so it doesn't try to re-connect as soon as the function gets recalled
  await connect('ws://localhost:8009','valid_authToken',loop,mySharedObj) //connection to remote object with mySharedObj
  console.log(mySharedObj) //to show you that it works >:D
  //remember that the default port it tries to put the websocket on is 8009 when you don't give it a server
}
loop()
