let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
mainObj.m=mainObj; //example object(it's cyclic too)

(async()=>{
  let myWebject=serve(mainObj) //I would let it make it's own server since I don't have one to give it to
  /*if you do already have a server, you can just pass it in through the second argument*/
  myWebject.addListener("connect",(ev)=>{
    console.log(`connection with token ${ev.token.authToken} spotted >:}\n`); ev.lock() //will only activate once since lock activated
    /*example use WITHOUT authToken parameter*/
  })
  
  setInterval(()=>mainObj.c[0]++,500) //slight edit to objects every 500 ms
  
  let viewKey=myWebject.addToken(1) //a new view only token(because authLevel is 1)
  
  let serverLocation="ws://localhost:8009" //by default it would TRY to host on port 8009
  
  let sharedObj=await connect(serverLocation,viewKey)
  try{await connect(serverLocation,viewKey)}catch(err){console.log("viewKey1:",err,"\n")} //locked room so appropriate error thrown
  
  let viewKey2=myWebject.addToken(1)
  myWebject.lock(viewKey2) //example use WITH authToken parameter
  try{await connect(serverLocation,viewKey)}catch(err){console.log("viewKey2:",err,"\n")} //locked room so appropriate error thrown
})()