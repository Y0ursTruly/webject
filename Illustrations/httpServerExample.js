let {serve,connect}=require('webject') //for a github installation, it'd be path/to/webject.js
//you can use the above example if you installed this from npm
let lvl1Token=null; let myOnlineDomain="webject-example.paultaylor2.repl.co/" //replace myOnlineDomain with your own
var myServer=(require('http'))
.createServer((req,res)=>res.end(
  `<script>window.authToken="${lvl1Token}"</script>
  <script src="https://cdn.jsdelivr.net/npm/webject/webject.js"></script>
  <p>You should see 2 logs made to the console(ctrl+shift+i)</p>
  <br><p>Next, paste the following code(by the time you pop up inspect tools, the 2 logs would be made most likely)</p>
  <br><i><b>connect("wss://${myOnlineDomain}",authToken).then(obj=>window.mySharedObj=obj)</b></i>
  <br><p>after that promise is resolved, <b>mySharedObj</b> would be the object shared from this server :D</p>`
))
myServer.listen(8009)
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
mainObj.m=mainObj; //example object(it's cyclic too)

(async()=>{
  let myWebject=serve(mainObj,myServer) //I would let it make it's own server since I don't have one to give it to
  /*if you do already have a server, you can just pass it in through the second argument*/
  
  setInterval(()=>mainObj.c[0]++,500) //slight edit to object every 500 ms
  
  let viewKey=myWebject.addToken(1) //a new view only token(because authLevel is 1)
  console.log(viewKey)
  lvl1Token=viewKey
  
  let serverLocation="ws://localhost:8009"
  //by default it would TRY to host on port 8009
  //but will default to the server's port(given you gave the serve function a server)
  
  let sharedObj=await connect(serverLocation,viewKey) //just a test connection
  //the interval doesn't show the objects
  //it shows the number of people connected
  let clientCount=0
  setInterval(()=>{ //every 5 seconds show the client count
    let currentCount=myWebject.authTokens[viewKey].clients.length
    if(clientCount==currentCount){return;}
    clientCount=currentCount
    console.log("client-count:",clientCount)
  },5000)
})()
