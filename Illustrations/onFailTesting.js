setTimeout(()=>process.exit(0),20001)
let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
mainObj.m=mainObj //example object(it's cyclic too)

let myWebject=serve(mainObj);

async function loop(){
  await new Promise(r=>setTimeout(r,3000)) //so it doesn't try to re-connect as soon as the function gets recalled
  await connect('ws://localhost:89','invalid_authToken',loop) ////will fail but retry will occur due to loop being passed as the onFail function
  //remember that the default port it tries to put the websocket on is 8009 when you don't give it a server
}
loop()
