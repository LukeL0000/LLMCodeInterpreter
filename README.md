# LLM Code Interpreter (aka PromptCoded)

## About the project:

It is a web application designed to help students improve code comprehension. The application will display code samples that the students are responsible for interpreting. The interpretation is tested through the use of an LLM model, which generates code based on the prompt provided by the user.

User data is stored to an SQLite database, enabling features including progress analysis and other analytics in the form of student and instructor dashboards. An additional "user flagging" system was implemented as a failsafe to override cases where LLM code generation was faulty. 


## Docker Compose:
To prepare the docker container(s) for this project, run the following command under the project directory:

```
docker compose up
```
Ensure that all containers on docker are running before proceeding to the application VIA the following link:

http://localhost:3000


## Note for the login page:
Below are previously made accounts used for testing. You may also use the accounts by using the below credentials when loggin in:
```
username: TestUser or TestUser2 

password: test123
```

To access the instructor account, please use the credentials:
```
username: Instructor

password: test123
```


## Code Sample Prompts:

The LLM is extremely finicky, and unfortuantely no amount of prompt engineering can make it always generate working code. Code samples 3, 9, and 10 were too complicated for the LLM and were excluded. Here are some prompts to try, which (in general) will work:
```
code sample 1 (number, number) -> number :
a function that takes two numbers and returns the sum.

code sample 2 (string, number) -> string :
takes the substring from index 0 to bar of the string foo.

code sample 4 (array, number) -> boolean :
searches for a number bar in an array of numbers foo. returns a boolean on if bar is in foo.

code sample 5 (string) -> string :
takes a string and reverses it.

code sample 6 (array, array) -> array :
takes two arrays and concatenates them.

code sample 7 (array) -> string :
takes an array of strings foo, and combines all the elements into a single string. 

code sample 8 (number) -> array **very finicky LLM code! :
(This function generates an array containing the first foo numbers starting with 0 of the Fibonacci sequence.)

```

Please allow up to a minute for the LLM to complete the generation.
Most cases will only take several seconds.
