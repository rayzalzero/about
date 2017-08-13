function cet() {
  setTimeout(() => {
      console.log('hayooo')
  }, 2000);
}
cet((err, result)=>{
    if(err){
        throw new Error(err);
    }
})
function checkPalindrome(inputString) {
console.log(inputString.split("").reverse().join(""));
    if (inputString == inputString.split("").reverse().join("")){
return true;
}
else {
return false;
}
}
function adjacentElementsProduct(inputArray) {
    console.log(inputArray[1]);
   var maxProduct = inputArray[0] * inputArray[1];
for (var i = 0; i < inputArray.length; i++) {
if (maxProduct < inputArray[i] * inputArray[i+1]) {
maxProduct = inputArray[i] * inputArray[i+1];
}
}
return maxProduct;

 
}
data = [3, 6, -2, -5, 7, 3];
console.log(adjacentElementsProduct(data));
console.log('This should run before the asyncDivision returns its result.')