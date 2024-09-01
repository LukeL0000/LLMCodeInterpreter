import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from './hooks/AuthProvider';
import "./style/appStyle.css";
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card } from 'antd';
import TicketModal from './TicketModal.js';

const passGrade = 3;

const Codesample = () => {
  const [codeSample, setCodeSample] = useState([]);
  const [description, setDescription] = useState('');
  const [retryComment, setRetryComment] = useState('');
  const [attemptID, setAttemptID] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [retrySent, setRetrySent] = useState(false);
  const [testResult, setTestResult] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [llmCode, setLLmCode] = useState('');
  const [codeSampleCode, setCodeSampleCode] = useState('');
  const [unitTestResult, setUnitTestResult] = useState([])
  const [unitTestsJSON, setUnitTestsJSON] = useState({})
  const [codeCouldRun, setCodeCouldRun] = useState(-1)
  const [llm_outputs, setllm_outputs] = useState([])

  const auth = useAuth();

  let currentUser = auth.user;
  let skip = "false";

  const requestURL = `http://localhost:9000/codesamples/${currentUser}/${skip}`;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(requestURL);
      const json = await response.json();
      setCodeSample(json);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [requestURL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    try {
      setCodeSampleCode(codeSample['code_sample'].sample_code);
    } catch (error) {
      setCodeSampleCode('No more sample found');
    }
  }, [codeSample]);

  const handleRetry = async (retryComment, attemptID) => {
    const data = {
      username: currentUser,
      code_sample_id: codeSample['code_sample'].code_sample_id,
      retryComment,
      attempt_id: attemptID
    };
    try {
      const response = await fetch(`http://localhost:9000/attempts/${encodeURIComponent(currentUser)}/${encodeURIComponent(data.code_sample_id)}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      //console.log(result);
      if (result.success) {
        setRetrySent(true);
      }
    } catch (error) {
      console.error('Error submitting retry data:', error);
    }
  };

  const handleSubmit = async (event) => {
    setTestResult(-1);
    event.preventDefault();
    setIsLoading(true);

    const data = {
      username: currentUser,
      code_sample_id: codeSample['code_sample'].code_sample_id,
      user_description: description
    };

    try {
      const response = await fetch(`http://localhost:9000/attempts/${encodeURIComponent(currentUser)}/${encodeURIComponent(data.code_sample_id)}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      //console.log(result);
      setTestResult(result.data.test_result);
      setLLmCode(result.data.llm_code);
      setAttemptID(result.data.attempt_id);
      setUnitTestResult(result.data.unit_test_result);
      setUnitTestsJSON(result.data.unit_tests_json)
      //console.log(result.data.code_could_run)
      setCodeCouldRun(result.data.code_could_run)
      setllm_outputs(result.data.llm_outputs)
      //console.log(llm_outputs)
      if (result.success) {
        setDescription('');
      }
      if (result.data.test_result === 0 || result.data.test_result === 1) {
        await handleRetry(retryComment, result.data.attempt_id);
        setRetryComment('')
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setTestResult(-1);
    fetchData();
  };

  return (
    <Card
      title={`Question ${codeSample['code_sample']?.code_sample_id ?? 'N/A'}`}
      style={{ margin: '24px 10px' }}
    >
      <div className="codeSampleDiv">
        <div className="codeSampleCode">

          <SyntaxHighlighter language="javascript" style={oneLight} showLineNumbers customStyle={{ width: '100%' }}>
            {codeSampleCode}
          </SyntaxHighlighter>

          {testResult !== -1 && (
            <>
              <ul>
                {Array.isArray(unitTestResult) && unitTestResult.length > 0 ? (
                  unitTestResult.map((item, index) => (
                    <li
                      key={index}
                      className={item === 1 ? 'passed' : 'failed'}
                    >
                      Unit test {index + 1} {item === 1 ? 'Passed' : 'Failed'}
                      <p>(
                        {JSON.stringify(unitTestsJSON.inputs[index].foo)}
                        {unitTestsJSON.inputs[index].bar !== undefined ? ', ' + JSON.stringify(unitTestsJSON.inputs[index].bar) : ''}
                        )
                        ==&gt;  &nbsp;
                        {JSON.stringify(unitTestsJSON.outputs[index].returnVal)}
                      </p>
                      <p>
                        LLM Code Output: {llm_outputs[index] != false ? llm_outputs[index] : 'LLM code couldn\'t run!'}
                      </p>


                    </li>
                  ))
                ) : (
                  codeCouldRun === -1 ? (
                    <>
                      <li className="failed">LLM response was parsed but code cannot be compiled.</li>
                      <li className="failed">If you believe your description was accurate, please create a ticket.</li>
                    </>
                  ) : (
                    <li>No unit test results available.</li>

                  )
                )}
              </ul>
            </>
          )}

          {testResult !== -1 && testResult !== passGrade && (
            <TicketModal
              currentUser={currentUser}
              codeSample={codeSample['code_sample']}
              attemptID={attemptID}
              setTicketSent={setTicketSent}
            />
          )}
        </div>

        <div className="forms">
          {codeSampleCode !== "No more sample found" && (
            <>
              <form onSubmit={handleSubmit}>
                {testResult !== passGrade && (
                  <>
                    <p className="codeSampleP">Enter Description Here:</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </>
                )}


                {testResult !== -1 && testResult !== passGrade && (
                  <>
                    <p className="codeSampleP">Enter A Retry Comment:</p>
                    <textarea
                      value={retryComment}
                      onChange={(e) => setRetryComment(e.target.value)}
                      required
                    ></textarea>
                  </>
                )}

                {isLoading ? (
                  <button type="submit" disabled>
                    Waiting for result...
                  </button>
                ) : testResult === -1 ? (
                  <button type="submit">Submit</button>
                ) : testResult !== passGrade ? (
                  <button type="submit">Retry</button>
                ) : (
                  <></>
                )}


                <div className={testResult === 3 ? 'passed' : (testResult >= 0) && (testResult < 3) ? 'failed' : 'normal'}>
                  {testResult === 3 ? (
                    <div>
                      <p style={{ color: 'green', fontWeight: 'bold' }}>Test Result: Passed</p>
                      <p>LLM Code: {llmCode}</p>
                    </div>
                  ) : (testResult >= 0) && (testResult < 3) ? (
                    <div>
                      <p style={{ color: 'red', fontWeight: 'bold' }}>Test Result: Failed</p>
                      <p>Parsed LLM Code: {llmCode}</p>
                    </div>
                  ) : (
                    <div>
                      <p>Test Result: Not available.</p>
                      <p>LLM Code: Not available.</p>
                    </div>
                  )}
                </div>


                {testResult === -1 ? (
                  <button type="button" onClick={handleNext}>Skip</button>
                ) : (
                  <button type="button" onClick={handleNext}>Next</button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Codesample;
