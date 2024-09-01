describe('Metrics', () => {
    const axios = window.axios;

    describe('metricsRestAPI', () => {
        it('should get a successful response from the user with attempts', function (done) {
            axios.get('http://localhost:9000/metrics/TestUser')
                .then(function (response) {
                    //console.log(response.data);
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data).to.have.keys(['attempts', 'maxScores', 'passedQuestions', 'totalAttempts', 'totalQuestions', 'passGrade']);
                    chai.expect(response.data.maxScores).that.has.lengthOf(7);
                    chai.expect(response.data.passGrade).to.equal(3);
                    chai.expect(response.data.attempts.data.length).to.be.above(0);
                    done();

                })
                .catch(function (error) {
                    done(error);
                });
        });


        it('should get a successful response for a new student with no attempts', function (done) {
            axios.get('http://localhost:9000/metrics/test')
                .then(function (response) {
                    //console.log(response.data);
                    chai.expect(response.status).to.equal(200);
                    chai.expect(response.data).to.be.an('object');
                    chai.expect(response.data).to.have.keys(['attempts', 'maxScores', 'passedQuestions', 'totalAttempts', 'totalQuestions', 'passGrade']);
                    chai.expect(response.data.maxScores).that.has.lengthOf(7);
                    chai.expect(response.data.passGrade).to.equal(3);
                    chai.expect(response.data.totalAttempts).to.have.property('COUNT(DISTINCT code_sample_id)', 0);
                    done();

                })
                .catch(function (error) {
                    done(error);
                });
        });

    });
});
