setTimeout(()=>process.exit(0),20001)
let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],f:function(){},undefined} //key f gets skipped(because it's a function)
mainObj.m=mainObj; //example object(it's cyclic too)

(async()=>{
  let myWebject=serve(mainObj) //I would let it make it's own server since I don't have one to give it to
  /*if you do already have a server, you can just pass it in through the second argument*/
  
  setInterval(()=>mainObj.c[0]++,500) //slight edit to object every 500 ms
  
  let viewKey=myWebject.addToken(1) //a new view only token(because authLevel is 1)
  
  let serverLocation="ws://localhost:8009" //by default it would TRY to host on port 8009
  
  let sharedObj=await connect(serverLocation,viewKey)
  setInterval(()=>{ //every 5 seconds show the shared cyclic object
    console.log("\n\n\nThe main object is\n",mainObj); console.log("\n\nThe shared object is:\n",sharedObj)
  },5000)
})()
