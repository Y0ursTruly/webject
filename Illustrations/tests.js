const test=require('node:test'), assert=require('node:assert');
const {serve, connect, sync, desync, objToString, stringToObj, objValueFrom}=require('..');
const { resolve } = require('node:path');
const { addListener } = require('node:process');

(async function(){
  let slash=process.platform=="win32"?"\\":"/", serverLocation="ws://localhost:8009"
  const mainObj={a:{a1:1,a2:{a3:0}},b:{b1:2},c:new Uint8Array([3,4]),undefined};
  mainObj.m=mainObj;
  const mainObj2={n:1,i:true,o:false,p:true};
  const myWebject=serve(mainObj)
  let lvl3Key=myWebject.addToken(3)
  let lvl2Key=myWebject.addToken(2)
  let viewKey=myWebject.addToken(1), viewKey2=myWebject.addToken(1,mainObj2)
  let manualToken=myWebject.addToken(1,mainObj2,"manual_token")

  const sharedObj=await connect(serverLocation,viewKey)
  const sharedObj1=await connect(serverLocation,viewKey)
  const sharedObj2=await connect(serverLocation,viewKey2)
  async function sharedObjectsEqual(){
    await new Promise(ok=>setTimeout(ok,50)) //by now change should be implemented
    for(let i=0;i<arguments.length;i++)
      assert.deepStrictEqual(mainObj,arguments[i]);
  }

  //first set of tests
  await test("1) Ensuring Objects Shared",async function(t){
    await t.test("After initial 'connect'",async function(){
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("On modification",async function(){
      mainObj.c[0]++;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("On deletion",async function(){
      delete mainObj.m;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("On insertion",async function(){
      mainObj.m=mainObj;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("Do functions get ignored?",async function(){
      mainObj.fn=function(){return 'boilerplate'}
      await new Promise(ok=>setTimeout(ok,50)) //by now change should be implemented
      assert.strictEqual(Object.getOwnPropertyDescriptor(sharedObj,'fn'),undefined) //key was not shared
      delete mainObj.fn
    })
  })

  //second set of tests
  await test("2) Serialisation Based Checks",async function(t){
    await t.test("Conversion between objToString and stringToObj",async function(){
      assert.deepStrictEqual(stringToObj(objToString(mainObj,true)),mainObj)
    })
    await t.test("Usage of objValueFrom",async function(){
      assert.strictEqual(objValueFrom(['c','0'],mainObj),mainObj.c[0])
      assert.strictEqual(objValueFrom(['a','a2','a3'],mainObj),mainObj.a.a2.a3)
    })
  })

  //third set of tests
  await test("3) Verification of 'webject' Methods",async function(t){
    var count=0
    function lockListener({lock}){ //destructuring example(function still works)
      //this function is used in addListener
      count+=5
      lock() //the token used to connect with was locked
    }
    await t.test("Manual authToken connection",async function(){
      let resolve=null, temp=new Promise(r=>resolve=r), resolver=ev=>resolve(ev.token.authToken);
      myWebject.addListener("connect",resolver)
      assert.deepStrictEqual(await connect(serverLocation,manualToken),sharedObj2)
      assert.strictEqual(await temp,manualToken)
      myWebject.endListener("connect",resolver)
    })
    await t.test("Locking and unlocking",async function(){
      myWebject.addListener("connect",lockListener)
      assert.deepStrictEqual(await connect(serverLocation,manualToken),sharedObj2)
      try{await connect(serverLocation,manualToken)}
      catch(err){
        assert.strictEqual(
          (err.message||err).split('\n').at(-1),
          "authToken LOCKED: this is a correct key, but it takes no new connections 0_0"
        )
        //"magic string" source: webject.js line 320
      }
    })
    await t.test("Proof of endListener",async function(){
      let currentCount=count
      myWebject.endListener("connect",lockListener) //count changes every connection
      assert.deepStrictEqual(await connect(serverLocation,viewKey),mainObj) //but it won't change
      assert.deepStrictEqual(await connect(serverLocation,viewKey),mainObj) //didn't throw locked error
      assert.strictEqual(currentCount,count) //no change since listener was already ended
    })
    await t.test("Ensuring ping logic doesn't disconnect you",async function(){
      await new Promise(r=>setTimeout(r,5001))
      mainObj.newkeyy=3;
      await sharedObjectsEqual(sharedObj,sharedObj1)
    })
    await t.test("authLevel 2 and 3 tokens",async function(){
      let temp2=await connect(serverLocation,lvl2Key) //can only insert new items
      let temp3=await connect(serverLocation,lvl3Key) //can delete, modify, insert new items
      delete temp3.newkeyy;
      await sharedObjectsEqual(sharedObj,sharedObj1,temp3)
      temp2.newkeyy=4;
      await sharedObjectsEqual(sharedObj,sharedObj1,temp2)
      temp2.newkeyy++;
      await sharedObjectsEqual(sharedObj,sharedObj1)
      assert.notDeepStrictEqual(mainObj,temp2) //since lvl2 shouldn't be able to modify
      delete temp2.newkeyy;
      await sharedObjectsEqual(sharedObj,sharedObj1)
      assert.notDeepStrictEqual(mainObj,temp2) //since lvl2 shouldn't be able to delete
    })
    //failing tests start
    //the issue is that everyone gets the edit
    await t.test("Edit and disconnect handling",async function(){
      let resolve=null, temp=new Promise(r=>resolve=r)
      myWebject.addListener("edit",function({socket,token}){
        console.log("edit",token.authToken,token.object)
        if(socket) socket.close(1000);
        assert.equal(token.authToken,viewKey)
      })
      myWebject.addListener("disconnect",function({token}){
        console.log(["disconnect"],token.object)
        resolve(token.authToken)
      })
      let temp3=await connect(serverLocation,lvl3Key) //can delete, modify, insert new items
      temp3.newKey=2 //an edit
      assert.strictEqual(await temp,viewKey)
    })
    //failing tests stop
  })

  //fourth set of tests
  await test("4) Verification of 'connect' Methods",async function(t){})

  //fifth set of tests
  await test("5) Usage of 'sync' and 'desync' Functions",async function(t){})

  setTimeout(_=>process.exit(0),50)
})()
