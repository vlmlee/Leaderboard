function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(fn, ...args) {
    await timeout(1000);
    return fn(...args);
}

module.exports = {
    timeout,
    sleep
};
