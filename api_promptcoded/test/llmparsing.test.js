function parseLlmCode(llm_code) {

    let returnVal = llm_code;
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

describe('LLM Parsing', function() {

    it('should parse LLM code successfully variant 1', function() {
        const parsedCode = parseLlmCode('```function myFunction() {}```');
        expect(parsedCode).to.include('function myFunction');
    });

    it('should parse LLM code successfully variant 2', function() {
        const parsedCode = parseLlmCode('``` function gg() {asdfgagsasdg} ```');
        expect(parsedCode).include.to.include('function gg()');
    })

});