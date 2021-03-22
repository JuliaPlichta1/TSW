const fun1 = (results, cb) => {
    setTimeout(() => {
        console.log('fun1');
        results.push(1);
        cb(results);
    }, Math.random() * 1000);
};

const fun2 = (results, cb) => {
    setTimeout(() => {
        console.log('fun2');
        results.push(2);
        cb(results);
    }, Math.random() * 1000);
};

const fun3 = (results, cb) => {
    setTimeout(() => {
        console.log('fun3');
        results.push(3);
        cb(results);
    }, Math.random() * 1000);
};

const fun4 = (results, cb) => {
    setTimeout(() => {
        console.log('fun4');
        results.push(4);
        cb(results);
    }, Math.random() * 1000);
};

const razemTab = (funTab, cb) => {
    var results = [];

    var check = (results) => {
        if (results.length === funTab.length) {
            cb(results);
        }
    };

    funTab.forEach((fun) => {
        fun(results, check);
    });
};


razemTab([fun1, fun2, fun3, fun4], (data) => {
    console.log("Finished");
    data.forEach((item) => {
        console.log(`Data from functions: ${item}`);
    });
});