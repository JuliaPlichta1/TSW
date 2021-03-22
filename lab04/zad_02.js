const fun1 = (number, results, cb) => {
    setTimeout(() => {
        console.log('fun1');
        results.push(number);
        cb(results);
    }, Math.random() * 1000);
};

const fun2 = (number, results, cb) => {
    setTimeout(() => {
        console.log('fun2');
        results.push(number);
        cb(results);
    }, Math.random() * 1000);
};

const razem = (fun1, fun2, cb) => {
    let results = [];
    let check = (results) => {
        if (results.length === 2) {
            cb(results);
        }
    }

    fun1(1, results, check);
    fun2(2, results, check);
};

razem(fun1, fun2, (data) => {
    console.log("Finished");
    console.log(`Data from fun1: ${data[0]} and fun2: ${data[1]}`);
});
