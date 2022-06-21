//fun fact: ev.token is null for any client that never got access to any kind of token
setTimeout(()=>process.exit(0),2001)
let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
var mainObj2={n:1,i:true,o:false,p:true}
mainObj.m=mainObj; //example object(it's cyclic too)

(async()=>{
  let myWebject=serve(mainObj) //I would let it make it's own server since I don't have one to give it to
  /*if you do already have a server, you can just pass it in through the second argument*/
  let toRemove=(ev)=>console.log("\nThis listener is before the one that prevents default so it runs\n") //this gets removed later down
  myWebject.addListener("connect",toRemove)
  myWebject.addListener("connect",(ev)=>{
    let tokenInfo=ev.token //this is an object made from the function addToken, constructed like {authToken,authLevel,clients:[],object,locked:false}
    console.log(`connection with token ${tokenInfo.authToken} spotted >:}\n`); ev.preventDefault() //now the second listener wouldn't activate
  })
  myWebject.addListener("connect",console.log) //this listener will not activate since default prevented
  
  //new edit event introduced in version 1.1.0
  myWebject.addListener("edit",({token})=>{ if(token.object==mainObj){console.log("edit event activated\nmainObj.c[0] ===",mainObj.c[0],"\n")} })
  
  setInterval(()=>{mainObj.c[0]++;mainObj2.n++},500) //slight edit to objects every 500 ms
  
  let viewKey=myWebject.addToken(1) //a new view only token(because authLevel is 1)
  
  let viewKey2=myWebject.addToken(1,mainObj2) //using an object as the second command
  
  let serverLocation="ws://localhost:8009" //by default it would TRY to host on port 8009
  
  let sharedObj=await connect(serverLocation,viewKey)
  myWebject.endListener("connect",toRemove) //demonstration of removing a listener
  let sharedObj2=await connect(serverLocation,viewKey2)
})()
