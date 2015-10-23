var through2Batch = require('./through2-batch');
var _ = require('lodash');
var streamify = require('stream-array');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

describe("through2-batch", function() {
    var objs = [];
    var stream;

    before(function(done) {
        _.each(_.range(0, 1000), function(i) {
            objs.push(i);
        });
        done();
    });

    after(function(done) {
        objs = [];
        done();
    });

    beforeEach(function(done) {
        stream = streamify(objs);
        done();
    });

    afterEach(function(done) {
        stream = null;
        done();
    });

    it("should accept options", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true}, transform, function() {
            expect(transform.callCount).to.be.above(0);
            done();
        }));
    });

    it("should accept arguments without options", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch.obj(transform, function() {
            expect(transform.callCount).to.be.above(0);
            done();
        }));
    });

    it("should accept arguments without flush", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true}, transform));

        stream.on('end', function() {
            expect(transform.callCount).to.be.above(0);
            done();
        });
    });

    it("should have a default batchSize", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true}, transform, function() {
            shouldHaveBatchedWithSize(10, transform);
            done();
        }));
    });

    it("should accept a batchSize option", function(done) {
        var transform = sinon.stub().yields();

        stream.pipe(through2Batch({objectMode: true, batchSize: 32}, transform, function() {
            shouldHaveBatchedWithSize(32, transform);
            done();
        }));
    });

    describe("obj", function() {
        it("should have a default batchSize", function(done) {
            var transform = sinon.stub().yields();

            stream.pipe(through2Batch.obj(transform, function() {
                shouldHaveBatchedWithSize(10, transform);
                done();
            }));
        });

        it("should accept a batchSize option", function(done) {
            var transform = sinon.stub().yields();

            stream.pipe(through2Batch.obj({batchSize: 32}, transform, function() {
                shouldHaveBatchedWithSize(32, transform);
                done();
            }));
        });

    });

    function shouldHaveBatchedWithSize(batchSize, transform) {
        var totalBatches = Math.ceil(objs.length / batchSize);
        expect(transform.callCount).to.be.equal(totalBatches);

        _.each(_.range(0, totalBatches), function(batchIndex) {
            var batch = transform.getCall(batchIndex).args[0];
            expect(batch.length).to.be.most(batchSize);
        });
    }
});
