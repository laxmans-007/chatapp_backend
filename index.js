// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler

let promises = [];

for(let i =0; i < 5; i++) {
    promises.push(((i) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("i = "+ i);
          }, 1000);
          resolve(i);
      })
    })(i))
}

function test(i) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("i = "+ i);
      }, 1000);
  });
}
async function testFun(pro) {
    return await Promise.allSettled(pro);
}
let res = await testFun(promises);
console.log("res - ", res);