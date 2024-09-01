/*
unit tests for ../routes/users.js
*/

describe('Users', () => {
    const testUser = {
        username: 'TestUser',
        name: 'Test User',
        password: 'test123',
        role: 'Student'
    }

    const testUser2= {
        username: 'Test#User.2?',
        name: 'Test User',
        password: 'Correct#Psw_3!',
        role: 'Student'
    }


    describe('loginValidator', () => {
        it("There is NO row in users table with matching username returns false (user doesn't exist)", () => {
            chai
            .expect(loginValidator(null, 'test123'))
            .to
            .equal(false);

            chai
            .expect(loginValidator(null, null))
            .to
            .equal(false);
        });

        it('Null password should return false', () => {
            chai
            .expect(loginValidator(testUser, null))
            .to
            .equal(false);

            chai
            .expect(loginValidator(testUser, ''))
            .to
            .equal(false);
        });

        it('input password and saved password match (case-sensitive & special chars) should return true', () => {
            chai
            .expect(loginValidator(testUser, 'test123'))
            .to
            .equal(true);

            chai
            .expect(loginValidator(testUser2, 'Correct#Psw_3!'))
            .to
            .equal(true);
        });

        it('Case-sensitive - passwords not matching should return false', () => {
            chai
            .expect(loginValidator(testUser, 'teSt123'))
            .to
            .equal(false);

            chai
            .expect(loginValidator(testUser2, 'CORRECT#PSW_3!'))
            .to
            .equal(false);

            chai
            .expect(loginValidator(testUser2, 'correct#psw!'))
            .false
            .equal(false);
        });

        it("input password and saved password don't match should return false", () => {
            chai
            .expect(loginValidator(testUser, 'wrongpassword'))
            .to
            .equal(false);

            chai
            .expect(loginValidator(testUser2, 'CorrectPsw_3!'))
            .to
            .equal(false);
        });
    });

    describe('userExists', () => {
        it('There is a row in users table with matching username returns true', () => {
            chai
            .expect(userExists(testUser))
            .to
            .equal(true);

            chai
            .expect(userExists(testUser2))
            .to
            .equal(true);

            chai
            .expect(userExists({testUser, testUser2}))
            .to
            .equal(true);
        });

        it('There is NO row in users table with matching username returns false', () => {
            chai
            .expect(userExists())
            .to
            .equal(false);

            chai
            .expect(userExists(null))
            .to
            .equal(false);

            chai
            .expect(userExists(''))
            .to
            .equal(false);
        });
    });

    describe('checkPassword', () => {
        it('Null should return false', () => {
            chai
            .expect(checkPassword())
            .to
            .equal(false);

            chai
            .expect(checkPassword(null, "test"))
            .to
            .equal(false);

            chai
            .expect(checkPassword(testUser, null))
            .to
            .equal(false);

            chai
            .expect(checkPassword(testUser, ''))
            .to
            .equal(false);
        });

        it('input password and saved password match (case-sensitive & special chars) should return true', () => {
            chai
            .expect(checkPassword(testUser, 'test123'))
            .to
            .equal(true);

            chai
            .expect(checkPassword(testUser2, 'Correct#Psw_3!'))
            .to
            .equal(true);
        });

        it('Case-sensitive not matching should return false', () => {
            chai
            .expect(checkPassword(testUser, 'Test123'))
            .to
            .equal(false);

            chai
            .expect(checkPassword(testUser2, 'Correct#psw_3!'))
            .to
            .equal(false);
        });

        it("input password and saved password don't match should return false", () => {
            chai
            .expect(checkPassword(testUser, 'wrongpassword'))
            .to
            .equal(false);

            chai
            .expect(checkPassword(testUser2, 'CorrectPsw_3!'))
            .to
            .equal(false);
        });
    });

    describe('generateToken', () => {
        it('should return a string', () => {
            chai
            .expect(generateToken())
            .to.be
            .a('string');
        });
    });

    describe('usersRestAPI', () => {
        it('should get a successful response from the API', function(done) {
            axios.get('http://localhost:9000/users')
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    done();
                })
                .catch(function(error) {
                    done(error);
                });
        });
    });

    describe('loginUsersRestAPI', () => {
        it('should get a successful response from the API for a student', function(done) {
            axios.post('http://localhost:9000/users/login', {
                username: 'testuser',
                password:'test123'
              })
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.status).to.equal(200);
                    chai.expect(response.data.data.user.username).to.be.equal('TestUser');
                    chai.expect(response.data.data.user.name).to.be.equal('Test User');
                    chai.expect(response.data.data.user.role).to.be.equal('Student');
                    chai.expect(response.data.token).to.be.a('string');
                    done();
              }).catch(function(error) {
                done(error);
              });
        });

        it('should get a successful response from the API for an instructor', function(done) {
            axios.post('http://localhost:9000/users/login', {
                username: 'instructor',
                password:'test123'
              })
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.status).to.equal(200);
                    chai.expect(response.data.data.user.username).to.be.equal('Instructor');
                    chai.expect(response.data.data.user.name).to.be.equal('Instructor Name');
                    chai.expect(response.data.data.user.role).to.be.equal('Instructor');
                    chai.expect(response.data.token).to.be.a('string');
                    done();
              }).catch(function(error) {
                done(error);
              });
        });

        it('should get a 400 response from the API if username does NOT exist', function(done) {
            axios.post('http://localhost:9000/users/login', {
                username: 'username non existent',
                password:'test123'
              })
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.status).to.equal(400);
                    chai.expect(response.data.error).to.equal("Username or password is incorrect");
                    done();
              }).catch(function(error) {
                done(error);
              });
        });

        it('should get a 400 response from the API if password does NOT match username', function(done) {
            axios.post('http://localhost:9000/users/login', {
                username: 'testuser',
                password:'wrong password'
              })
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.status).to.equal(400);
                    chai.expect(response.data.error).to.equal("Username or password is incorrect");
                    done();
              }).catch(function(error) {
                done(error);
              });
        });
    });

    describe('registerUsersRestAPI', () => {
        it('should get a successful response from the API - account gets added to db successfully', function(done) {
            axios.post('http://localhost:9000/users/register', {
                name: 'test',
                username: 'test',
                password:'test'
              })
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
              }).catch(function(error) {
                done(error);
              });

            axios.get('http://localhost:9000/users')
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.data[response.data.data.length - 1].name).to.equal('test');
                    chai.expect(response.data.data[response.data.data.length - 1].username).to.equal('test');
                    chai.expect(response.data.data[response.data.data.length - 1].password).to.equal('test');
                    chai.expect(response.data.data[response.data.data.length - 1].role).to.equal('Student');
                    done();
                })
                .catch(function(error) {
                    done(error);
                });
        });

        it('should get a 400 response from the API if username already exists - no account gets added to db', function(done) {
            axios.post('http://localhost:9000/users/register', {
                name: 'test1',
                username: 'testuser',
                password:'test'
              })
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.status).to.equal(400);
                    chai.expect(response.data.error).to.equal("Username already exists - choose a new username");
              }).catch(function(error) {
                done(error);
              });

            axios.get('http://localhost:9000/users')
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.data[response.data.data.length - 1].name).to.not.equal('test1')
                    done();
                })
                .catch(function(error) {
                    done(error);
                });
        });

        it('should get a 400 response from the API if account for name already exists - no account gets added to db', function(done) {
            axios.post('http://localhost:9000/users/register', {
                name: 'Test User',
                username: 'test1',
                password:'test'
              })
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.status).to.equal(400);
                    chai.expect(response.data.error).to.equal("Account for this name already exists");
              }).catch(function(error) {
                done(error);
              });

            axios.get('http://localhost:9000/users')
                .then(function(response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.data[response.data.data.length - 1].username).to.not.equal('test1')
                    done();
                })
                .catch(function(error) {
                    done(error);
                });
        });
    });
});
