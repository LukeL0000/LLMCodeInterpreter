//Testing methods to parse LLM response.

//LLM responses
let LLM_Response_1 = "Here's a simple JavaScript function that takes an array `foo` as input and returns its string representation:" 
                + "```javascript function resultFunc(foo) { return JSON.stringify(foo); // Convert the array to JSON format } ```"
                + " This function takes an array `foo` as input, converts it into a JSON string using the `JSON.stringify()` method, "
                + "and returns the resulting string. The `resultFunc` function is just a simple example of how you could use this function"
                + "in your own code. You can modify it to suit your specific needs or add additional functionality based on the array's contents."
let LLM_Response_2 = "Here's a simple JavaScript function that meets the specifications you provided: ```javascript function resultFunc(foo) { //"
                +" Check if `foo` is a valid number if (isNaN(foo)) { throw new Error('Invalid input'); } // Calculate and return the first `foo`"
                +" numbers in the Fibonacci sequence const n = foo; const f1 = 0; const f2 = 1; for (let I = 0; I < n - 1; i++) { const f3 = f2 + f1;"
                +" const f4 = f3 + f1; const f5 = f4 + f1; // Update the first three numbers in the sequence f1 = f2; f2 = f3; f3 = f4; f4 = f5; } "
                +"return [f1, f2, f3]; } ``` This function takes a single argument `foo` and returns an array containing the first `foo` numbers in the"
                +" Fibonacci sequence. The function checks if `foo` is a valid number using the `isNaN()` method before attempting to calculate and return "
                +"the sequence. If `foo` is not a valid number, the function throws an error with a descriptive message. The function uses a loop to calculate"
                +" and update the first three numbers in the sequence. The loop starts at index 0 (the first number) and increments each time it encounters a"
                +" non-zero value in `foo`. It then adds the current value of `f1` to the previous value of `f2`, which is stored in `f2`. It also adds the current"
                +" value of `f3` to the previous value of `f4`, which is stored in `f4`. Finally, it adds the current value of `f5` to the previous value of `f1`, "
                +"which is stored in `f1`. The function returns an array containing the first three numbers in the sequence."

// takes string LLM response and parses it into a function
function parseLLM (llm_response) {

    let returnVal = llm_response;
    let strIndex = 0;

    //first remove everything before the function comment block
    strIndex = returnVal.search("```");
    returnVal = returnVal.substring(strIndex, returnVal.length);

    // next remove everything before the function
    strIndex = returnVal.search("function");
    returnVal = returnVal.substring(strIndex, returnVal.length);

    // next remove everything after the function comment block
    strIndex = returnVal.search("```");
    returnVal = returnVal.substring(0, strIndex);

    return returnVal;
}

//console.log(parseLLM(LLM_Response_2));