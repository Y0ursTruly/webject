setTimeout(()=>process.exit(0),2001)
let {serve,connect}=require('../webject.js');

(async()=>{
  var arr=[1,2,3]; var objToShare={arr}
  let myWebject=serve(objToShare)
  let myToken=myWebject.addToken(3)
  let url="ws://localhost:8009"
  
  let myClientObj=await connect(url,myToken)
  myClientObj.arr.push(4) //in 1.0.8 and under, arr would remain as [1,2,3] where objToShare.arr would be re-pointed to another object
  setTimeout(()=>console.log(arr),200) //but now, that bug is fixed >:D
})()
