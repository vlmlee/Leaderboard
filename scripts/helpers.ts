function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(fn, ...args) {
    await timeout(250);
    return fn(...args);
}

module.exports = {
    timeout,
    sleep
};
