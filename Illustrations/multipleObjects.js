let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
var mainObj2={n:1,i:true,o:false,p:true}
mainObj.m=mainObj; //example object(it's cyclic too)

(async()=>{
  let myWebject=serve(mainObj) //I would let it make it's own server since I don't have one to give it to
  /*if you do already have a server, you can just pass it in through the second argument*/
  
  setInterval(()=>{mainObj.c[0]++;mainObj2.n++},500) //slight edit to objects every 500 ms
  
  let viewKey=myWebject.addToken(1) //a new view only token(because authLevel is 1)
  
  let viewKey2=myWebject.addToken(1,mainObj2) //using an object as the second command
  
  let serverLocation="ws://localhost:8009" //by default it would TRY to host on port 8009
  
  let sharedObj=await connect(serverLocation,viewKey)
  
  let sharedObj2=await connect(serverLocation,viewKey2)
  
  setInterval(()=>{ //every 5 seconds show the first main and shared & the second main and shared
    console.log("\n\n\nThe main object is\n",mainObj); console.log("\n\nThe shared object is:\n",sharedObj)
    console.log("\n\n\nThe main object (2) is\n",mainObj2); console.log("\n\nThe shared object (2) is:\n",sharedObj2)
  },5000)
})()