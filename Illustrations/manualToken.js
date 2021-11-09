setTimeout(()=>process.exit(0),3001)
let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined} //even undefined value gets shared >:D
mainObj.m=mainObj; //example object(it's cyclic too)

(async()=>{
  let myWebject=serve(mainObj)
  let myManualToken="my_manual_t0ken"

  myWebject.addToken(1,null,myManualToken) //null because I'm sharing the default object
  //if I don't want to share the default object(from the serve command), I can put a different object
  
  myWebject.addListener("connect",ev=>{
    let token=ev.token.authToken
    console.log('connection to manual token:',[token]) //shows manual token name
    //this manual token name IS the authToken and not some random text generated
  })

  let serverLocation="ws://localhost:8009" //by default it would TRY to host on port 8009
  
  await connect(serverLocation,myManualToken)
  //the manual tokens must be unique(not previously existing)
  //if a manual token is existing, addToken function will throw an error
})()