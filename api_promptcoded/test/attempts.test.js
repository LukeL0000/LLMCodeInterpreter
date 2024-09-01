describe('API Attempts Tests', () => {
    const axios = window.axios;


    const portForAttempts = "http://localhost:9000";
    const testUser = "TestUser";
    const codeSampleId = 1; // replace with an appropriate code sample id


    describe('GetAttempts', () => {
        it('should get a successful response with all required fields', function (done) {
            axios.get(`${portForAttempts}/attempts`)
                .then(function (response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.data).to.be.an('array');

                    response.data.data.forEach(item => {
                        chai.expect(item).to.have.property('attempt_id');
                        chai.expect(item).to.have.property('username');
                        chai.expect(item).to.have.property('code_sample_id');
                        chai.expect(item).to.have.property('timestamp');
                        chai.expect(item).to.have.property('test_result');
                        chai.expect(item).to.have.property('llm_code');
                        chai.expect(item).to.have.property('user_description');
                        chai.expect(item).to.have.property('ticket_comment');
                        chai.expect(item).to.have.property('flagged');
                    });

                    done();
                })
                .catch(function (response) {
                    done(error);
                });
        });

        it('should get a successful response for one user', function (done) {
            axios.get(`${portForAttempts}/attempts/${testUser}`)
                .then(function (response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.data).to.be.an('array');

                    response.data.data.forEach(item => {
                        chai.expect(item).to.have.property('attempt_id');
                        chai.expect(item).to.have.property('username');
                        chai.expect(item).to.have.property('code_sample_id');
                        chai.expect(item).to.have.property('timestamp');
                        chai.expect(item).to.have.property('test_result');
                        chai.expect(item).to.have.property('llm_code');
                        chai.expect(item).to.have.property('user_description');
                        chai.expect(item).to.have.property('ticket_comment');
                        chai.expect(item).to.have.property('flagged');
                        chai.expect(item.username).to.equal(testUser);
                    });

                    done();
                })
                .catch(function (response) {
                    done(error);
                });
        });

        it('should count attempts for one question', function (done) {
            axios.get(`${portForAttempts}/attempts/${testUser}/${codeSampleId}/count`)
                .then(function (response) {
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data).to.have.property('status');
                    chai.expect(response.data).to.have.property('data');
                    chai.expect(response.data).to.have.property('success');
                    chai.expect(response.data.status).to.be.a('number');
                    chai.expect(response.data.status).to.be.at.least(0);
                    chai.expect(response.data.data).to.be.an('array').that.has.lengthOf(1);

                    done();
                })
                .catch(function (response) {
                    done(error);
                });
        });
    });

    describe('PostAttempts', () => {
        // it('should post an attempt and return the correct schema', function (done) {
        //     const postData = {
        //         user_description: "create a function which has two parameters and return their sum"
        //     };

        //     axios.post(`${portForAttempts}/attempts/${testUser}/${codeSampleId}/post`, postData)
        //         .then(function (response) {
        //             chai.expect(response.status).to.equal(200);
        //             chai.expect(response.data).to.be.an('object');
        //             chai.expect(response.data.status).to.exist;
        //             chai.expect(response.data.success).to.exist;
        //             chai.expect(response.data.data).to.exist.and.to.be.an('object');
        //             chai.expect(response.data.data.attempt_id).to.exist;
        //             chai.expect(response.data.data.test_result).to.exist;
        //             chai.expect(response.data.data.llm_code).to.exist;

        //             done();
        //         })
        //         .catch(function (response) {
        //             done(error);
        //         });
        // });

        it('should return an error for a post attempt without user description', function (done) {
            axios.post(`${portForAttempts}/attempts/${testUser}/${codeSampleId}/post`,
                {
                    "user_description": null
                })
                .then(function (response) {
                    if (response.data.status === 300) {
                        chai.expect(response.data).to.be.an('object');
                        chai.expect(response.data.error).to.equal('Required fields missing');
                        chai.expect(response.data.success).to.be.false;
                        done();
                    } else {
                        done(new Error(`Expected status 300 but got ${response.data.status}`));
                    }
                })
                .catch(function (error) {
                    chai.expect(error.data.status).to.equal(300);
                    chai.expect(error.data.error).to.equal('Required fields missing');
                    chai.expect(error.response.success).to.be.false;
                    done();
                });
        });

        it('should return an error for a post attempt with incorrect code_sample_id', function (done) {
            const incorrectCodeSampleId = 999; // replace with an invalid id
            const postData = {
                user_description: "create a function which has two parameters and return their sum"
            };
            this.timeout(10000);
            axios.post(`${portForAttempts}/attempts/${testUser}/${incorrectCodeSampleId}/post`, postData)
                .then(function (response) {
                    // Check the response body for error details
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data.status).to.equal(400);
                    chai.expect(response.data.success).to.be.false;
                    chai.expect(response.data.error).to.equal("No unit test found for code_sample_id 999");
                    done();
                })
                .catch(function (error) {
                    // Handle unexpected errors
                    done(new Error(`Unexpected error: ${error.message}`));
                });
        });

    });
});
