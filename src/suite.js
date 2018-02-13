import Benchmark from './benchmark';


/**
 * A set of {@link Benchmark}s for executing those sequential or parallel.
 *
 * Suite will execute by flow like this.
 *
 *   - {@link Suite#before}
 *   - {@link Suite#beforeEach}
 *   - {@link Benchmark#before}
 *   - {@link Suite#beforeTest}
 *   - {@link Benchmark#beforeEach}
 *   - {@link Benchmark#fun}
 *   - {@link Benchmark#afterEach}
 *   - {@link Suite#afterTest}
 *   - {@link Benchmark#after}
 *   - {@link Suite#afterEach}
 *   - {@link Suite#after}
 *
 * Each function can override with options of the constructor.
 *
 *
 * @example
 * import {Suite} from 'asyncmark';
 *
 *
 * const suite = new Suite({
 *     name: 'ways to find a character',
 *     beforeEach() {
 *         this.text = 'hello world';
 *     },
 *     parallel: true,
 * });
 *
 * suite.add(function() {
 *     /o/.test(this.text);
 * });
 *
 * suite.add({
 *     name: 'String#indexOf',
 *     before() {
 *         console.log('starting String#indexOf...');
 *     },
 *     fun() {
 *         this.text.indexOf('o') > -1;
 *     },
 * });
 *
 * suite.add(new Benchmark({
 *     name: 'String#match',
 *     fun() {
 *         Boolean(this.text.match(/o/));
 *     },
 *     after(result) {
 *         console.log('String#match is done! ' + result);
 *     },
 * }));
 *
 * suite.run()
 *     .then(results => {
 *         let min = results[0];
 *         results.forEach(x => {
 *             if (min.average > x.average) {
 *                 min = x;
 *             }
 *         });
 *         console.log(min.name + ' is best way!');
 *     }).
 *     catch(err => console.error(err));
 */
export default class Suite {
    /**
     * @param {Object} [options={}] - options for this suite.
     * @param {Number} [options.name='unnamed'] - name of this suite.
     * @param {Boolean} [options.parallel=false] - flag for executing each benchmark parallelly.
     * @param {function(): ?Promise} [options.before] - setup function. see {@link Suite#before}.
     * @param {function(count: Number, benchmark: Benchmark): ?Promise} [options.beforeEach] - setup function. see {@link Suite#beforeEach}.
     * @param {function(suiteCount: Number, benchCount: Number, benchmark: Benchmark): ?Promise} [options.beforeTest] - setup function. see {@link Suite#beforeTest}.
     * @param {function(suiteCount: Number, benchCount: Number, benchmark: Benchmark, msec: Number): ?Promise} [options.afterTest] - teardown function. see {@link Suite#afterTest}.
     * @param {function(count: Number, benchmark: Benchmark, result: Result): ?Promise} [options.afterEach] - teardown function. see {@link Suite#afterEach}.
     * @param {function(results: Result[]): ?Promise} [options.after] - teardown function. see {@link Suite#after}.
     * @param {Object} [options.benchmarkDefault={}] - default options for {@link Suite#add}.
     */
    constructor(options = {}) {
        /**
         * Name of this suite.
         *
         * @type {String}
         */
        this.name = options.name || 'unnamed';

        /**
         * Default options for benchmarks in this suite.
         *
         * @type {Object}
         */
        this.benchmarkDefault = options.benchmarkDefault || {};

        /**
         * A list of {@link Benchmark}.
         *
         * @type {Benchmark[]}
         */
        this.benchmarks = [];

        /**
         * Flag for executing each benchmark parallelly.
         *
         * @type {Boolean}
         */
        this.parallel = options.parallel || false;

        this.before = options.before || this.before;
        this.beforeEach = options.beforeEach || this.beforeEach;
        this.beforeTest = options.beforeTest || this.beforeTest;
        this.afterTest = options.afterTest || this.afterTest;
        this.afterEach = options.afterEach || this.afterEach;
        this.after = options.after || this.after;
    }

    /**
     * Setup before execute all benchmarks.
     *
     * At the time executing this method, `this` is the unique object for the suite.
     * So you can use `this` for storing testing data like a database.
     * Data of `this` that set in this method will discard after call {@link Suite#after}.
     *
     * In default, do nothing.
     *
     * @return {?Promise} {@link Suite} will await if returns {@link Promise}. Resolved value never evaluation.
     */
    async before() {}

    /**
     * Setup before execute each benchmark.
     *
     * At the time executing this method, `this` is the unique object for the benchmark.
     * So you can use `this` for storing testing data like a database.
     * Data of `this` that set in this method will discard after call {@link Suite#afterEach}.
     *
     * In default, do nothing.
     *
     * @param {Number} count - count of done benchmarks in this suite.
     * @param {Benchmark} benchmark - a {@link Benchmark} instance that will execute.
     *
     * @return {?Promise} {@link Suite} will await if returns {@link Promise}. Resolved value never evaluation.
     */
    async beforeEach(count, benchmark) {}

    /**
     * Setup before execute each test of benchmarks.
     *
     * At the time executing this method, `this` is the unique object for the test.
     * So you can use `this` for storing testing data like a database.
     * Data of `this` that set in this method will discard after call {@link Suite#afterTest}.
     *
     * In default, do nothing.
     *
     * @param {Number} suiteCount - count of done benchmarks in this suite.
     * @param {Number} benchCount - count of done tests in this benchmark.
     * @param {Benchmark} benchmark - a {@link Benchmark} instance that will execute.
     *
     * @return {?Promise} {@link Suite} will await if returns {@link Promise}. Resolved value never evaluation.
     */
    async beforeTest(suiteCount, benchCount, benchmark) {}

    /**
     * Teardown after execute each test of benchmarks.
     *
     * At the time executing this method, `this` is the unique object for the test.
     * So you can use `this` for storing testing data like a database.
     * Data of `this` that set in this method will discard after call this method
     *
     * In default, do nothing.
     *
     * @param {Number} suiteCount - count of done benchmarks in this suite.
     * @param {Number} benchCount - count of done tests in this benchmark.
     * @param {Benchmark} benchmark - a {@link Benchmark} instance that executed.
     * @param {Number} msec - a result of this test.
     *
     * @return {?Promise} {@link Suite} will await if returns {@link Promise}. Resolved value never evaluation.
     */
    async afterTest(suiteCount, benchCount, benchmark, msec) {}

    /**
     * Teardown after execute each benchmark.
     *
     * At the time executing this method, `this` is the unique object for the benchmark.
     * So you can use `this` for storing testing data like a database.
     * Data of `this` that set in this method will discard after call this method.
     *
     * In default, do nothing.
     *
     * @param {Number} count - count of done benchmarks in this suite.
     * @param {Benchmark} benchmark - a {@link Benchmark} instance that executed.
     * @param {Result} result - a result of this benchmark.
     *
     * @return {?Promise} {@link Suite} will await if returns {@link Promise}. Resolved value never evaluation.
     */
    async afterEach(count, benchmark, result) {}

    /**
     * Teardown after execute all benchmarks.
     *
     * At the time executing this method, `this` is the unique object for the suite.
     * So you can use `this` for storing testing data like a database.
     * Data of `this` that set in this method will discard after call this method.
     *
     * In default, do nothing.
     *
     * @param {Result[]} results - a list of benchmark result.
     *
     * @return {?Promise} {@link Suite} will await if returns {@link Promise}. Resolved value never evaluation.
     */
    async after(results) {}

    /**
     * Adding {@link Benchmark} instance into this {@link Suite}.
     *
     * @param {Benchmark} benchmark - the benchmark instance for adding.
     *
     * @return {Suite} returns this suite for method chain.
     */
    addBenchmark(benchmark) {
        this.benchmarks.push(benchmark);
        return this;
    }

    /**
     * Adding child {@link Suite} instance into this {@link Suite}.
     *
     * @param {Suite} suite - the suite instance for adding.
     *
     * @return {Suite} returns this suite for method chain.
     */
    addSuite(suite) {
        this.benchmarks.push(suite);
        return this;
    }

    /**
     * Make new benchmark or suite and adding into this {@link Suite}.
     *
     * @param {Benchmark|Suite|Object|function} child - {@link Benchmark}, {@link Suite}, or arguments for {@link Benchmark#constructor}.
     *
     * @return {Suite} returns this suite for method chain.
     */
    add(child) {
        if (child instanceof Benchmark) {
            this.addBenchmark(child);
        } else if (child instanceof Suite) {
            this.addSuite(child);
        } else if (typeof child === 'function') {
            const options = {fun: child};
            options.__proto__ = this.benchmarkDefault;
            this.addBenchmark(new Benchmark(options));
        } else {
            const options = Object.assign({}, child);
            options.__proto__ = this.benchmarkDefault;
            this.addBenchmark(new Benchmark(options));
        }
        return this;
    }

    /**
     * Make callbacks for {@link Benchmark#run}.
     *
     * @param {Number} count - count of benchmark in this suite.
     * @param {Object} parentCallbacks - callback functions of parent suite. same as callbacks of {@link Suite#run}.
     *
     * @return {Object} callbacks.
     *
     * @ignore
     */
    _makeCallbacks(count, parentCallbacks) {
        const that = this;

        return {
            beforeTest(c, b) {
                if (parentCallbacks.beforeTest) {
                    parentCallbacks.beforeTest.call(this, c, b);
                }
                that.beforeTest.call(this, count, c, b);
            },
            afterTest(c, b, r) {
                that.afterTest.call(this, count, c, b, r);
                if (parentCallbacks.afterTest) {
                    parentCallbacks.afterTest.call(this, c, b, r);
                }
            },
        };
    }

    /**
     * Execute benchmarks parallelly.
     *
     * @param {Object} context - the context for execute.
     * @param {Object} callbacks - callback functions. same as callbacks of {@link Suite#run}.
     *
     * @return {Promise<Result[]>} result of benchmarks.
     *
     * @ignore
     */
    async _runParallel(context, callbacks) {
        await this.before.call(context);

        const results = await Promise.all(this.benchmarks.map(async (x, i) => {
            const ctx = Object.assign({}, context);

            await this.beforeEach.call(ctx, i, x);
            const result = await x.run(ctx, this._makeCallbacks(i, callbacks));
            await this.afterEach.call(ctx, i, x, result);
            return result;
        }));

        await this.after.call(context, results);

        return results;
    }

    /**
     * Execute benchmarks sequential.
     *
     * @param {Object} context - the context for execute.
     * @param {Object} callbacks - callback functions. same as callbacks of {@link Suite#run}.
     *
     * @return {Promise<Result[]>} result of benchmarks.
     *
     * @ignore
     */
    async _runSequential(context, callbacks) {
        await this.before.call(context);

        const results = [];
        for (let i=0; i<this.benchmarks.length; i++) {
            const b = this.benchmarks[i];
            const ctx = Object.assign({}, context);
            await this.beforeEach.call(ctx, i, b);
            const result = await b.run(ctx, this._makeCallbacks(i, callbacks));
            results.push(result);
            await this.afterEach.call(ctx, i, b, result);
        }

        await this.after.call(context, results);

        return results;
    }

    /**
     * Execute benchmarks in this suite.
     *
     * All benchmarks will execute parallel if enabled {@link Suite#parallel} option.
     * Else do execute sequentially by added order.
     *
     * @param {Object} [context={}] - the `this` for each benchmarking functions. `__proto__` will override with this instance.
     * @param {Object} [callbacks={}] - callback functions.
     * @param {function(count: Number, benchmark: Benchmark): ?Promise} [callbacks.beforeTest] - callback function that will be called when before executing each test.
     * @param {function(count: Number, benchmark: Benchmark, msec: Number)} [callbacks.afterTest] - callback function that will be called when after executing each test.
     *
     * @return {Promise<Result[]>} An array of {@link Result}s.
     */
    async run(context = {}, callbacks = {}) {
        context = Object.assign({}, context);
        context.__proto__ = this;

        if (this.parallel) {
            return await this._runParallel(context, callbacks);
        } else {
            return await this._runSequential(context, callbacks);
        }
    }
}