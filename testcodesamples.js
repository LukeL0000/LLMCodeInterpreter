// USE THIS JAVASCRIPT FILE TO TEST CODE SAMPLES AND ENSURE THAT THEY RUN.


// CODE SAMPLE 5
function codeSample5(foo) {

    let returnVal = ''

    for( let i = foo.length - 1; i >= 0; i-- ) {
        returnVal += foo[i];
    }

    return returnVal;
}

// CODE SAMPLE 6
function codeSample6(foo, bar) {
    let returnVal = [];

    for(let i = 0; i < foo.length; i ++) {
        returnVal.push(foo[i]);
    }

    for(let i = 0; i < bar.length; i ++) {
        returnVal.push(bar[i]);
    }

    return returnVal;
}

// CODE SAMPLE 7
function codeSample7(foo) {
    let returnVal = '';

    for(let i = 0; i < foo.length; i++) {
        returnVal += foo[i];
    }

    return returnVal;
}

// CODE SAMPLE 8
function codeSample8(foo) {
    if (foo <= 0) return [];
    if (foo === 1) return [0];

    //hint: these are the first 2 numbers in the fibonacci sequence
    let returnVal = [0, 1];

    //start counting from 3rd index
    for (let i = 2; i < foo; i++) {
        returnVal.push(returnVal[i - 1] + returnVal[i - 2]);
    }

    return returnVal;
}

// CODE SAMPLE 9
function codeSample9(foo, bar) {
    let returnVal = [];

    for(let i = 0; i < bar; i++) {
        returnVal.push(foo[i])
    }

    return returnVal;
}

// CODE SAMPLE 10
function codeSample10(foo) {
    let returnVal = [];

    for (let i = foo.length - 1; i >= 0; i--) {
        //index of smallest element in array foo
        let min_index = i;

        for(let j = foo.length - 1; j >= 0; j--) {
            if(foo[j] < foo[min_index]) {
                min_index = j;
            }
        }
        
        returnVal.push(foo[min_index]);
        foo.splice(min_index, 1);
    }

    return returnVal;
}

// TESTS
// CODE SAMPLE 5
// console.log(codeSample5('hello world'));
// CODE SAMPLE 6
// console.log(codeSample6([1, 2, 3], [4, 5, 6]));
// CODE SAMPLE 7
// console.log(codeSample7(['h', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd']));
// CODE SAMPLE 8
// console.log(codeSample8(10));
// CODE SAMPLE 9
// console.log(codeSample9(['h', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd'], 5));
//console.log(codeSample10([1]))