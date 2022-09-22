function deepFind(obj: Object, keyToFind: string): any {
    return Object.entries(obj)
        .reduce((acc, [key, value]) => (key === keyToFind)
                ? acc.concat(value)
                : (typeof value === 'object')
                    ? acc.concat(deepFind(value, keyToFind))
                    : acc
            , [])
}

export default deepFind;
