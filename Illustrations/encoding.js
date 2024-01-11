setTimeout(()=>process.exit(0),50001)
let {serve,connect}=require('../webject.js')
var mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:[3,4],undefined}
mainObj.m=mainObj; //example object(it's cyclic too)

function encoder(data){
  let result=Buffer.from(data,'binary').toString('base64')
  console.log('encoding:\n>',[data],'as\n>',[result])
  return result
}
function decoder(data){
  let result=Buffer.from(data,'binary').toString('base64')
  console.log('decoding:\n>',[data],'as\n>',[result])
  return result
};

(async()=>{
  let myWebject=serve(mainObj,{encoder,decoder})
  setInterval(()=>mainObj.c[0]++,500)
  
  let viewKey=myWebject.addToken(1)
  let serverLocation="ws://localhost:8009"
  
  let sharedObj=await connect(serverLocation,viewKey,null,null,{encoder,decoder})
})()
