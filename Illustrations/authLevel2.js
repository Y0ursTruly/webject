let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
mainObj.m=mainObj; //example object(it's cyclic too)

(async()=>{
  let myWebject=serve(mainObj) //I would let it make it's own server since I don't have one to give it to
  /*if you do already have a server, you can just pass it in through the second argument*/
  
  function time(ms){return new Promise(finish=>setTimeout(finish,ms))}
  
  let adderKey=myWebject.addToken(2) //you can only add new data in authLevel 2
  let serverLocation="ws://localhost:8009" //by default it would TRY to host on port 8009
  
  let sharedObj=await connect(serverLocation,adderKey)
  
  sharedObj.c[1]=99; await time(3000)
  console.log("attempts to modify existing key(won't affect server)")
  console.log("main object:",mainObj,"\nshared object:",sharedObj)
  
  sharedObj.a=[]; await time(3000)
  console.log("attempts to delete existing keys(won't affect server)")
  console.log("\nmain object:",mainObj,"\nshared object:",sharedObj)
  
  sharedObj.newKey='hi'; await time(3000)
  console.log("adds new key(authLevel 2 is allowed to do this)")
  console.log("\nmain object:",mainObj,"\nshared object:",sharedObj)
  
  process.exit(0)
})()